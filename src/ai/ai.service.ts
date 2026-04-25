import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, timeout } from 'rxjs';
import { ProductsService } from '../products/products.service';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ProductInfo {
  id: string;
  name: string;
  price: number;
  category: string;
  gender?: string;
  images?: string[];
  sizes?: string[];
  colors?: string[];
  discount?: number;
}

const FALLBACK_RESPONSE = {
  text: 'Lo siento, tuve un problema. ¿Podrías intentar de nuevo?',
  products: []
};

const HF_TIMEOUT = 10000;

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly apiKey: string;
  private readonly hfRouterUrl = 'https://router.huggingface.co/v1/chat/completions';

  private readonly chatHistories: Map<string, ChatMessage[]> = new Map();
  private productsCache: ProductInfo[] = [];
  private lastCacheTime = 0;
  private readonly CACHE_TTL_MS = 5 * 60 * 1000;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    private productsService: ProductsService,
  ) {
    this.apiKey = this.configService.get<string>('HUGGING_FACE_API_KEY') || process.env['HUGGING_FACE_API_KEY'] || '';
  }

  private makeMessagesHistory(history: ChatMessage[]): { role: string; content: string }[] {
    return history.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    }));
  }

  private async getProductsCatalog(): Promise<ProductInfo[]> {
    if (this.productsCache.length > 0 && Date.now() - this.lastCacheTime < this.CACHE_TTL_MS) {
      return this.productsCache;
    }
    try {
      const products = await this.productsService.findAll();
      this.productsCache = products.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        category: p.category || '',
        gender: p.gender,
        images: p.images || [],
        sizes: p.sizes || [],
        colors: p.colors || [],
        discount: p.discount || 0
      }));
      this.lastCacheTime = Date.now();
      return this.productsCache;
    } catch (error) {
      this.logger.error('Error fetching products:', error.message);
      return [];
    }
  }

  private buildSystemPrompt(products: ProductInfo[]): string {
    const productList = products.slice(0, 30).map(p => {
      const sizes = p.sizes?.join(', ') || 'Todas';
      const colors = p.colors?.join(', ') || 'Varios';
      return `${p.id}|${p.name}|$${p.price}|${p.category}|${p.gender || 'Unisex'}|${sizes}|${colors}|${p.discount || 0}% descuento`;
    }).join('\n');

    return `Eres el asistente virtual de FashionStore, la mejor tienda de moda online de Colombia.
Tu trabajo es ayudar a los clientes a encontrar productos y responder sus preguntas.

REGLAS IMPORTANTES:
1. NUNCA inventes productos. Solo usa los del catálogo.
2. Siempre responde en formato JSON válido, nunca en texto plano cuando muestres productos.
3. Habla en español colombiano, amigable y servicial.
4. Sé conciso, no escribas mensajes muy largos.

CATÁLOGO DISPONIBLE:
${productList}
${products.length > 30 ? `[... y ${products.length - 30} productos más]` : ''}

CUANDO EL CLIENTE PIDA PRODUCTOS:
Analiza la petición y busca coincidencias en el catálogo.
Responde EXACTAMENTE así:
{
  "text": "Breve mensaje amigable (máximo 2 oraciones)",
  "products": [
    {
      "id": "uuid-del-producto",
      "name": "nombre exacto",
      "price": precio,
      "category": "categoría",
      "gender": "género",
      "images": ["url-imagen"],
      "sizes": ["S","M","L"],
      "colors": ["Negro","Blanco"],
      "discount": 0
    }
  ]
}

CUANDO NO HAYA PRODUCTOS:
{
  "text": "Lo siento, no tenemos ese producto. Estos son similares...",
  "products": []
}

CUANDO PREGUNTE POR OFERTAS:
Busca productos con discount > 0.
{
  "text": "¡Tenemos estas ofertas para ti!",
  "products": [...]
}

CUANDO PREGUNTE POR UNA CATEGORÍA (camisetas, pantalones, etc):
{
  "text": "Aquí tienes las [categoría] que tenemos:",
  "products": [...]
}

CUANDO QUIERA AÑADIR AL CARRITO:
No agregues nada al carrito tú. Solo muestra los productos disponibles.
El frontend se encargará de añadir al carrito cuando el usuario dé clic en el botón.
Responde con los productos que quiere añadir.

EJEMPLOS DE RESPUESTA CORRECTA:
{"text":"¡Claro! Aquí tienes las mejores camisetas de nuestra colección:","products":[{"id":"abc123","name":"Camiseta Algodón Basic","price":89000,"category":"Camisetas","gender":"Unisex","images":["https://..."],"sizes":["S","M","L","XL"],"colors":["Blanco","Negro"],"discount":0}]}

{"text":"No tenemos ese producto, pero te recomiendo estos jeans:","products":[...]}

{"text":"¡Claro! ¿Qué producto quieres añadir al carrito?","products":[]}

IMPORTANTE: Responde EXCLUSIVAMENTE JSON válido, sin texto antes o después.`;
  }

  private parseJsonResponse(text: string): { text: string; products: ProductInfo[] } {
    try {
      const match = text.match(/\{[\s\S*"text"[\s\S*"products"[\s\S]*\]/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (parsed.text && Array.isArray(parsed.products)) {
          return {
            text: parsed.text,
            products: parsed.products.map((p: any) => ({
              id: p.id || '',
              name: p.name || '',
              price: Number(p.price) || 0,
              category: p.category || '',
              gender: p.gender || '',
              images: p.images || [],
              sizes: p.sizes || [],
              colors: p.colors || [],
              discount: p.discount || 0
            }))
          };
        }
      }
    } catch (e) {
      this.logger.warn('Failed to parse JSON response');
    }
    return { text, products: [] };
  }

  async chat(message: string, sessionId: string): Promise<any> {
    let history = this.chatHistories.get(sessionId) || [];
    const products = await this.getProductsCatalog();
    const systemPrompt = this.buildSystemPrompt(products);

    const messages = [
      { role: 'system', content: systemPrompt },
      ...this.makeMessagesHistory(history),
      { role: 'user', content: message }
    ];

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          this.hfRouterUrl,
          {
            model: 'meta-llama/Llama-3.2-1B-Instruct',
            messages,
            max_tokens: 300,
            temperature: 0.7,
          },
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
          },
        ).pipe(timeout(HF_TIMEOUT)),
      );

      if (!response?.data?.choices?.length) {
        const reply = FALLBACK_RESPONSE;
        history.push({ role: 'user', content: message });
        history.push({ role: 'assistant', content: JSON.stringify(reply) });
        this.chatHistories.set(sessionId, history.slice(-12));
        return reply;
      }

      let replyText = response.data.choices[0].message.content || '';
      const shouldEscalate = replyText.startsWith('[ESCALAR]');
      if (shouldEscalate) replyText = replyText.replace('[ESCALAR]', '').trim();

      const result = this.parseJsonResponse(replyText);
      if (!result.text) {
        result.text = replyText;
      }

      history.push({ role: 'user', content: message });
      history.push({ role: 'assistant', content: replyText });
      this.chatHistories.set(sessionId, history.slice(-12));

      return {
        ...result,
        shouldEscalate,
        sessionId
      };

    } catch (error) {
      this.logger.error('Chat error:', error.response?.data || error.message);
      const reply = FALLBACK_RESPONSE;
      history.push({ role: 'user', content: message });
      history.push({ role: 'assistant', content: JSON.stringify(reply) });
      this.chatHistories.set(sessionId, history.slice(-12));
      return reply;
    }
  }

  async visualSearch(imageBase64: string): Promise<{ results: any[]; message?: string }> {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const products = await this.getProductsCatalog();

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          'https://router.huggingface.co/feature-extraction/google/vit-base-patch16-224',
          { inputs: base64Data },
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
          },
        ).pipe(timeout(8000)),
      );

      const labels = response.data?.slice(0, 8)?.map((item: any) => item.label.toLowerCase()) || [];

      if (labels.length === 0) {
        return this.getFeaturedProducts(products);
      }

      const matched = products.filter(product => {
        const searchText = `${product.name} ${product.category}`.toLowerCase();
        return labels.some(label =>
          searchText.includes(label) ||
          label.split(' ').some(word => searchText.includes(word) && word.length > 2)
        );
      });

      if (matched.length >= 2) {
        return {
          results: matched.slice(0, 8).map(p => ({
            productId: p.id,
            name: p.name,
            price: p.price,
            category: p.category,
            image: p.images?.[0] || '',
            score: 1
          })),
          message: `Encontré ${matched.length} productos similares`
        };
      }

      return this.getFeaturedProducts(products);

    } catch (error) {
      this.logger.error('Visual search error:', error.response?.data || error.message);
      return this.getFeaturedProducts(products);
    }
  }

  private getFeaturedProducts(products: ProductInfo[]): { results: any[]; message?: string } {
    const featured = products.slice(0, 8).map(p => ({
      productId: p.id,
      name: p.name,
      price: p.price,
      category: p.category,
      image: p.images?.[0] || '',
      score: 1
    }));

    return {
      results: featured,
      message: 'Te recomendamos nuestros productos destacados'
    };
  }

  async getRecommendations(viewedProductIds: string[]): Promise<{ recommendations: { productId: string; score: number }[] }> {
    try {
      const products = await this.getProductsCatalog();
      if (viewedProductIds.length === 0 || products.length === 0) {
        return { recommendations: [] };
      }

      const viewed = products.filter(p => viewedProductIds.includes(p.id));
      if (viewed.length === 0) {
        return { recommendations: [] };
      }

      const categories = [...new Set(viewed.map(p => p.category))];
      const recommendations = products
        .filter(p => !viewedProductIds.includes(p.id) && categories.includes(p.category))
        .slice(0, 8)
        .map(p => ({ productId: p.id, score: 0.9 }));

      return { recommendations };
    } catch (error) {
      return { recommendations: [] };
    }
  }

  clearChatHistory(sessionId: string): void {
    this.chatHistories.delete(sessionId);
  }
}