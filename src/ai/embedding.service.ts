import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, timeout } from 'rxjs';

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private readonly apiKey: string;
  private readonly viModel = 'openai/clip-vit-base-patch32';
  private readonly hfFeatureExtractionUrl = 'https://api-inference.huggingface.co/pipeline/feature-extraction';

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('HUGGING_FACE_API_KEY') || process.env['HUGGING_FACE_API_KEY'] || '';
  }

  async getImageEmbedding(imageBase64: string): Promise<number[]> {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.hfFeatureExtractionUrl}/${this.viModel}`,
          { inputs: base64Data },
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
          },
        ).pipe(timeout(8000)),
      );

      const data = response.data;

      if (Array.isArray(data) && data.length > 0) {
        if (Array.isArray(data[0])) {
          return data[0];
        }
        return data;
      }

      throw new Error('Invalid embedding response');
    } catch (error) {
      this.logger.error('Error getting image embedding:', error.response?.data || error.message);
      throw error;
    }
  }

  async getClassificationLabels(imageBase64: string): Promise<string[]> {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          'https://router.huggingface.co/models/google/vit-base-patch16-224',
          { inputs: base64Data },
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
          },
        ).pipe(timeout(8000)),
      );

      const data = response.data;

      if (Array.isArray(data) && data.length > 0) {
        return data.slice(0, 5).map((item: any) => item.label?.toLowerCase() || '');
      }

      return [];
    } catch (error) {
      this.logger.error('Error getting classification:', error.response?.data || error.message);
      return [];
    }
  }

  convertEmbeddingToStringArray(embedding: number[]): string[] {
    return embedding.map(String);
  }

  convertStringArrayToEmbedding(arr: string[]): number[] {
    return arr.map(Number);
  }
}
