import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AiService {
  private readonly apiKey: string;
  private readonly apiUrl = 'https://api-inference.huggingface.co/models';

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('HUGGING_FACE_API_KEY') ?? '';
  }

  // Chatbot de atención al cliente
  async chat(message: string) {
    const response = await firstValueFrom(
      this.httpService.post(
        `${this.apiUrl}/mistralai/Mistral-7B-Instruct-v0.2`,
        {
          inputs: `<s>[INST] Eres un asistente de una tienda de moda llamada FashionStore. 
          Ayuda al cliente con sus preguntas sobre productos, tallas, envíos y devoluciones.
          Responde siempre en español y de forma amable.
          
          Cliente: ${message} [/INST]`,
          parameters: {
            max_new_tokens: 200,
            temperature: 0.7,
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
    return { response: response.data[0]?.generated_text || 'Lo siento, no pude procesar tu mensaje.' };
  }

  // Recomendaciones de productos basadas en descripción
  async recommend(description: string, products: any[]) {
    const productList = products.map(p => `${p.name}: ${p.description}`).join('\n');
    
    const response = await firstValueFrom(
      this.httpService.post(
        `${this.apiUrl}/mistralai/Mistral-7B-Instruct-v0.2`,
        {
          inputs: `<s>[INST] Eres un experto en moda. Basándote en esta preferencia del cliente: "${description}"
          Recomienda los productos más adecuados de esta lista:
          ${productList}
          
          Responde en español con máximo 3 recomendaciones y explica brevemente por qué. [/INST]`,
          parameters: {
            max_new_tokens: 300,
            temperature: 0.7,
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
    return { recommendations: response.data[0]?.generated_text || 'No se pudieron generar recomendaciones.' };
  }

  // Búsqueda inteligente por texto
  async searchByText(query: string, products: any[]) {
    const response = await firstValueFrom(
      this.httpService.post(
        `${this.apiUrl}/sentence-transformers/all-MiniLM-L6-v2`,
        {
          inputs: {
            source_sentence: query,
            sentences: products.map(p => `${p.name} ${p.description} ${p.category}`),
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

    const scores = response.data as number[];
    const ranked = products
      .map((p, i) => ({ ...p, score: scores[i] }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return { results: ranked };
  }
}