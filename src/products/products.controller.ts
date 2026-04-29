import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { IsString, IsNumber, IsOptional, IsArray } from 'class-validator';

class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  price: number;

  @IsNumber()
  stock: number;

  @IsString()
  category: string;

  @IsString()
  @IsOptional()
  gender: string;

  @IsString()
  brand: string;

  @IsArray()
  @IsOptional()
  sizes: string[];

  @IsArray()
  @IsOptional()
  colors: string[];

  @IsArray()
  @IsOptional()
  images: string[];

  @IsNumber()
  @IsOptional()
  discount: number;
}

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(
    @Query('gender') gender?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.productsService.findAll(gender, category, search);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateProductDto>) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
