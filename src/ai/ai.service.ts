import { Injectable, Logger, HttpException, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { Product } from '../products/product.entity';
import { cosineSimilarity } from './helpers/similarity';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly apiKey: string;
  private readonly hfApiUrl = 'https://api-inference.huggingface.co/models';
  private readonly hfInferenceUrl = 'https://api-inference.huggingface.co/pipeline/feature-extraction';

  private readonly chatHistories: Map<string, ChatMessage[]> = new Map();
  private readonly imageEmbeddingsCache: Map<string, { embedding: number[]; timestamp: number }> = new Map();
  private readonly CACHE_TTL_MS = 60 * 60 * 1000;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {
    this.apiKey = this.configService.get<string>('HUGGING_FACE_API_KEY') ?? '';
  }

  private async callHfInference(model: string, inputs: any, parameters?: any): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.hfApiUrl}/${model}`,
          { inputs, parameters },
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`HF API error with model ${model}:`, error.response?.data || error.message);
      throw new HttpException(
        `Error communicating with AI service: ${error.response?.data?.error || error.message}`,
        error.response?.status || 502,
      );
    }
  }

  private async getEmbedding(text: string, model: string = 'sentence-transformers/all-MiniLM-L6-v2'): Promise<number[]> {
    const response = await this.callHfInference(model, { inputs: text });
    return Array.isArray(response) ? response : response[0] || response;
  }

  async getRecommendations(viewedProductIds: string[]): Promise<{ recommendations: { productId: string; score: number }[] }> {
    if (viewedProductIds.length === 0) {
      return { recommendations: [] };
    }

    const viewedProducts = await this.productRepository
      .createQueryBuilder('product')
      .whereInIds(viewedProductIds)
      .getMany();

    if (viewedProducts.length === 0) {
      return { recommendations: [] };
    }

    const viewedEmbeddings: number[][] = [];
    for (const product of viewedProducts) {
      const text = `${product.name} ${product.description} ${product.category || ''} ${product.brand || ''}`;
      try {
        const embedding = await this.getEmbedding(text);
        viewedEmbeddings.push(embedding);
      } catch (error) {
        this.logger.warn(`Failed to get embedding for product ${product.id}:`, error);
      }
    }

    if (viewedEmbeddings.length === 0) {
      throw new BadRequestException('Could not generate embeddings for viewed products');
    }

    const centroidEmbedding = viewedEmbeddings.reduce((acc, emb) =>
      acc.map((val, i) => val + emb[i] / viewedEmbeddings.length),
    );

    const allProducts = await this.productRepository
      .createQueryBuilder('product')
      .where('product.isActive = :isActive', { isActive: true })
      .andWhere('product.id NOT IN (:...viewedIds)', { viewedIds: viewedProductIds.length > 0 ? viewedProductIds : ['__none__'] })
      .getMany();

    const similarities: { productId: string; score: number }[] = [];

    for (const product of allProducts) {
      const text = `${product.name} ${product.description} ${product.category || ''} ${product.brand || ''}`;
      try {
        const productEmbedding = await this.getEmbedding(text);
        const similarity = cosineSimilarity(centroidEmbedding, productEmbedding);
        similarities.push({ productId: product.id, score: similarity });
      } catch (error) {
        this.logger.warn(`Failed to get embedding for product ${product.id}:`, error);
      }
    }

    similarities.sort((a, b) => b.score - a.score);

    return { recommendations: similarities.slice(0, 8) };
  }

  async chat(message: string, sessionId: string): Promise<{ reply: string; shouldEscalate: boolean; sessionId: string }> {
    const systemMessage = `Eres un asistente de atención al cliente de una tienda de moda online.
Eres amable, profesional y conciso. Conoces las siguientes políticas:
- Devoluciones hasta 30 días sin uso
- Envío gratis sobre $100.000 COP
- Los pedidos se procesan en 1-3 días hábiles
- Si el cliente está muy frustrado o el problema es un reembolso mayor a $50.000 COP, responde con la etiqueta [ESCALAR] al inicio de tu mensaje.
Responde siempre en el idioma del cliente.`;

    let history = this.chatHistories.get(sessionId) || [];

    history.push({ role: 'user', content: message });

    if (history.length > 10) {
      history = history.slice(-10);
    }

    const conversationHistory = history
      .map(msg => msg.role === 'user' ? `Cliente: ${msg.content}` : `Asistente: ${msg.content}`)
      .join('\n');

    const fullPrompt = `<s>[INST] ${systemMessage} [/INST]\n\n${conversationHistory}\n\nAsistente:`;

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.hfApiUrl}/mistralai/Mistral-7B-Instruct-v0.3`,
          {
            inputs: fullPrompt,
            parameters: {
              max_new_tokens: 300,
              temperature: 0.7,
              do_sample: true,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      let reply = response.data?.[0]?.generated_text || '';
      reply = reply.replace(fullPrompt, '').trim();

      if (reply.length === 0) {
        reply = 'Lo siento, no pude procesar tu mensaje. ¿Podrías reformular tu pregunta?';
      }

      const shouldEscalate = reply.startsWith('[ESCALAR]');

      history.push({ role: 'assistant', content: reply });
      this.chatHistories.set(sessionId, history);

      return { reply, shouldEscalate, sessionId };
    } catch (error) {
      this.logger.error('Chat error:', error.response?.data || error.message);
      throw new HttpException(
        'Error communicating with AI chat service',
        502,
      );
    }
  }

  async visualSearch(imageBase64: string, textFilter?: string): Promise<{ results: { productId: string; score: number; imageUrl: string }[] }> {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          'https://api-inference.huggingface.co/pipeline/feature-extraction/openai/clip-vit-base-patch32',
          {
            inputs: base64Data,
          },
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      const queryEmbedding: number[] = Array.isArray(response.data) ? response.data : response.data?.[0] || [];

      if (queryEmbedding.length === 0) {
        throw new BadRequestException('Could not extract features from the image');
      }

      const queryBuilder = this.productRepository
        .createQueryBuilder('product')
        .where('product.isActive = :isActive', { isActive: true })
        .andWhere('product.images IS NOT NULL')
        .andWhere('array_length(product.images, 1) > 0');

      if (textFilter) {
        queryBuilder.andWhere(
          'LOWER(product.name) LIKE :filter OR LOWER(product.description) LIKE :filter',
          { filter: `%${textFilter.toLowerCase()}%` },
        );
      }

      const products = await queryBuilder.getMany();

      const results: { productId: string; score: number; imageUrl: string }[] = [];

      for (const product of products) {
        if (!product.images || product.images.length === 0) continue;
        
        const imageKey = product.images[0];
        const cached = this.imageEmbeddingsCache.get(imageKey);
        let productEmbedding: number[];

        if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
          productEmbedding = cached.embedding;
        } else {
          try {
            const embResponse = await firstValueFrom(
              this.httpService.post(
                'https://api-inference.huggingface.co/pipeline/feature-extraction/openai/clip-vit-base-patch32',
                { inputs: imageKey },
                {
                  headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                  },
                },
              ),
            );
            productEmbedding = Array.isArray(embResponse.data) ? embResponse.data : embResponse.data?.[0] || [];
            this.imageEmbeddingsCache.set(imageKey, {
              embedding: productEmbedding,
              timestamp: Date.now(),
            });
          } catch {
            this.logger.warn(`Failed to get embedding for product image: ${imageKey}`);
            continue;
          }
        }

        const similarity = cosineSimilarity(queryEmbedding, productEmbedding);
        results.push({
          productId: product.id,
          score: similarity,
          imageUrl: imageKey,
        });
      }

      results.sort((a, b) => b.score - a.score);

      return { results: results.slice(0, 12) };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error('Visual search error:', error.response?.data || error.message);
      throw new HttpException(
        'Error processing visual search',
        502,
      );
    }
  }

  clearChatHistory(sessionId: string): void {
    this.chatHistories.delete(sessionId);
  }
}