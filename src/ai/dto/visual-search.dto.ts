import { IsString, IsOptional } from 'class-validator';

export class VisualSearchDto {
  @IsString()
  imageBase64: string;

  @IsOptional()
  @IsString()
  textFilter?: string;
}

export class VisualSearchResultItemDto {
  productId: string;
  score: number;
  imageUrl: string;
}

export class VisualSearchResponseDto {
  results: VisualSearchResultItemDto[];
}