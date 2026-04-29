import { IsString, IsOptional } from 'class-validator';

export class VisualSearchDto {
  @IsString()
  imageBase64: string;

  @IsOptional()
  @IsString()
  textFilter?: string;

  @IsOptional()
  @IsString()
  userMessage?: string;
}

export class VisualSearchResultItemDto {
  productId: string;
  name: string;
  price: number;
  image: string;
  category: string;
  score: number;
}

export class VisualSearchResponseDto {
  results: VisualSearchResultItemDto[];
  message?: string;
}
