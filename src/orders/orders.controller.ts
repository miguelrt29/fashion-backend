import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/order.dto';
import type { AuthenticatedRequest } from '../types/express';

@Controller('orders')
@UseGuards(AuthGuard('jwt'))
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.ordersService.create(req.user.userId, createOrderDto);
  }

  @Get()
  async findAll(@Request() req: AuthenticatedRequest) {
    return this.ordersService.findAllByUser(req.user.userId);
  }

  @Get(':id')
  async findOne(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.ordersService.findOne(id, req.user.userId);
  }

  @Get(':id/tracking')
  async getTracking(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.ordersService.getTracking(id, req.user.userId);
  }

  @Delete(':id')
  async cancel(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.ordersService.cancel(id, req.user.userId);
  }
}
