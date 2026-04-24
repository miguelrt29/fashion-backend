import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CartService } from './cart.service';

@Controller('cart')
@UseGuards(AuthGuard('jwt'))
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@Request() req: any) {
    return this.cartService.getCart(req.user.userId);
  }

  @Get('total')
  async getCartTotal(@Request() req: any) {
    return this.cartService.getCartTotal(req.user.userId);
  }

  @Post('add')
  async addItem(
    @Request() req: any,
    @Body()
    addItemDto: {
      productId: string;
      name: string;
      price: number;
      quantity: number;
      size?: string;
      color?: string;
      image?: string;
    },
  ) {
    return this.cartService.addItem(req.user.userId, addItemDto);
  }

  @Put('update/:itemId')
  async updateQuantity(
    @Request() req: any,
    @Param('itemId') itemId: string,
    @Body() body: { quantity: number },
  ) {
    return this.cartService.updateQuantity(itemId, req.user.userId, body.quantity);
  }

  @Delete('remove/:itemId')
  async removeItem(@Request() req: any, @Param('itemId') itemId: string) {
    return this.cartService.removeItem(itemId, req.user.userId);
  }

  @Delete('clear')
  async clearCart(@Request() req: any) {
    return this.cartService.clearCart(req.user.userId);
  }
}