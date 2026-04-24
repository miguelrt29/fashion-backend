import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AiService } from './ai.service';
import { GetRecommendationsDto, RecommendationsResponseDto } from './dto/recommendations.dto';
import { ChatDto, ChatResponseDto } from './dto/chat.dto';
import { VisualSearchDto, VisualSearchResponseDto } from './dto/visual-search.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('recommendations')
  @HttpCode(HttpStatus.OK)
  async getRecommendations(@Body() dto: GetRecommendationsDto): Promise<RecommendationsResponseDto> {
    return this.aiService.getRecommendations(dto.viewedProductIds);
  }

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  async chat(@Body() dto: ChatDto): Promise<ChatResponseDto> {
    return this.aiService.chat(dto.message, dto.sessionId);
  }

  @Post('visual-search')
  @HttpCode(HttpStatus.OK)
  async visualSearch(@Body() dto: VisualSearchDto): Promise<VisualSearchResponseDto> {
    return this.aiService.visualSearch(dto.imageBase64, dto.textFilter);
  }
}