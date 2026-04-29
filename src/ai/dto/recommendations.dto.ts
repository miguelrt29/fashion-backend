import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

export class GetRecommendationsDto {
  @IsArray()
  @IsUUID('4', { each: true })
  viewedProductIds: string[];

  @IsOptional()
  @IsUUID('4')
  userId?: string;
}

export class RecommendationItemDto {
  productId: string;
  score: number;
}

export class RecommendationsResponseDto {
  recommendations: RecommendationItemDto[];
}
