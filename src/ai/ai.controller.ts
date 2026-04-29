import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AiService } from './ai.service';
import {
  GetRecommendationsDto,
  RecommendationsResponseDto,
} from './dto/recommendations.dto';
import { ChatDto, ChatResponseDto } from './dto/chat.dto';
import {
  VisualSearchDto,
  VisualSearchResponseDto,
} from './dto/visual-search.dto';

@Controller('ai')
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(private readonly aiService: AiService) {}

  @Post('recommendations')
  @HttpCode(HttpStatus.OK)
  async getRecommendations(
    @Body() dto: GetRecommendationsDto,
  ): Promise<RecommendationsResponseDto> {
    try {
      return await this.aiService.getRecommendations(dto.viewedProductIds);
    } catch (error) {
      this.logger.error('Recommendations error:', error.message);
      return { recommendations: [] };
    }
  }

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  async chat(@Body() dto: ChatDto): Promise<ChatResponseDto> {
    try {
      return await this.aiService.chat(
        dto.message,
        dto.sessionId,
        dto.imageBase64,
      );
    } catch (error) {
      this.logger.error('Chat error:', error.message);
      return {
        text: 'Lo siento, el asistente no está disponible. Contáctanos en soporte@fashionstore.com',
        products: [],
        shouldEscalate: false,
        sessionId: dto.sessionId,
      };
    }
  }

  @Post('visual-search')
  @HttpCode(HttpStatus.OK)
  async visualSearch(
    @Body() dto: VisualSearchDto,
  ): Promise<VisualSearchResponseDto> {
    try {
      return await this.aiService.visualSearch(dto.imageBase64, dto.userMessage);
    } catch (error) {
      this.logger.error('Visual search error:', error.message);
      return { results: [] };
    }
  }
}
