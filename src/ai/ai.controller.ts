import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';
import { IsString } from 'class-validator';

class ChatDto {
  @IsString()
  message: string;
}

class RecommendDto {
  @IsString()
  description: string;

  products: any[];
}

class SearchDto {
  @IsString()
  query: string;

  products: any[];
}

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  chat(@Body() dto: ChatDto) {
    return this.aiService.chat(dto.message);
  }

  @Post('recommend')
  recommend(@Body() dto: RecommendDto) {
    return this.aiService.recommend(dto.description, dto.products);
  }

  @Post('search')
  searchByText(@Body() dto: SearchDto) {
    return this.aiService.searchByText(dto.query, dto.products);
  }
}