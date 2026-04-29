import {
  IsString,
  IsArray,
  IsOptional,
  ValidateNested,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ChatDto {
  @IsString()
  @Length(1, 1000)
  message: string;

  @IsString()
  @Length(1, 100)
  sessionId: string;

  @IsOptional()
  @IsString()
  imageBase64?: string;
}

export class ChatProductDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  price: number;

  @IsString()
  category: string;

  @IsOptional()
  gender?: string;

  @IsOptional()
  images?: string[];

  @IsOptional()
  sizes?: string[];

  @IsOptional()
  colors?: string[];

  @IsOptional()
  discount?: number;
}

export class ChatResponseDto {
  @IsString()
  text: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatProductDto)
  products: ChatProductDto[];

  @IsOptional()
  shouldEscalate?: boolean;

  @IsOptional()
  @IsString()
  sessionId?: string;
}
