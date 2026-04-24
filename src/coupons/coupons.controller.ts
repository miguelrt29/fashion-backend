import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CouponsService } from './coupons.service';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Get('validate')
  async validate(
    @Query('code') code: string,
    @Query('total') total: string,
    @Query('category') category?: string,
  ) {
    return this.couponsService.validate(code, Number(total), category);
  }

  @Post('apply')
  @UseGuards(AuthGuard('jwt'))
  async apply(@Body() body: { code: string }) {
    return this.couponsService.apply(body.code);
  }

  @Get('active')
  async getActiveCoupons() {
    return this.couponsService.getActive();
  }

  @Get()
  async getAll() {
    return this.couponsService.getAll();
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.couponsService.getById(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(
    @Body()
    createCouponDto: {
      code: string;
      type: 'percentage' | 'fixed';
      value: number;
      minPurchase?: number;
      maxDiscount?: number;
      expiresAt?: Date;
      usageLimit?: number;
      applicableCategories?: string[];
    },
  ) {
    return this.couponsService.create(createCouponDto);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Param('id') id: string,
    @Body()
    updateCouponDto: {
      type?: 'percentage' | 'fixed';
      value?: number;
      minPurchase?: number;
      maxDiscount?: number;
      expiresAt?: Date;
      usageLimit?: number;
      applicableCategories?: string[];
      isActive?: boolean;
    },
  ) {
    return this.couponsService.update(id, updateCouponDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async delete(@Param('id') id: string) {
    return this.couponsService.delete(id);
  }

  @Put(':id/toggle')
  @UseGuards(AuthGuard('jwt'))
  async toggleActive(@Param('id') id: string) {
    return this.couponsService.toggleActive(id);
  }
}