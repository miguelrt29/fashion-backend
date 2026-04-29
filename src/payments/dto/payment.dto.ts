import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PaymentItemDto {
  @IsString()
  productId: string;

  @IsString()
  name: string;

  @IsNumber()
  price: number;

  @IsNumber()
  quantity: number;

  @IsString()
  @IsOptional()
  image?: string;
}

export class CreateStripePaymentDto {
  @IsString()
  orderId: string;

  @IsNumber()
  amount: number;
}

export class CreateMercadoPagoPaymentDto {
  @IsString()
  orderId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentItemDto)
  items: PaymentItemDto[];

  @IsString()
  customerEmail: string;
}

export enum PaymentProvider {
  STRIPE = 'stripe',
  MERCADOPAGO = 'mercadopago',
}
