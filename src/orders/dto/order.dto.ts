import { IsArray, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsString()
  productId: string;

  @IsString()
  name: string;

  @IsNumber()
  price: number;

  @IsNumber()
  quantity: number;

  @IsString()
  size: string;

  @IsString()
  color: string;

  @IsString()
  @IsOptional()
  image?: string;
}

export class ShippingAddressDto {
  @IsString()
  name: string;

  @IsString()
  street: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  zip: string;

  @IsString()
  country: string;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsNumber()
  total: number;

  @IsEnum(['stripe', 'mercadopago', 'cash'])
  paymentMethod: 'stripe' | 'mercadopago' | 'cash';

  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;
}

export class UpdateOrderStatusDto {
  @IsEnum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'])
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
}