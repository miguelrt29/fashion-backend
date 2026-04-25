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
    const userId = req.user.userId || req.user.sub;
    return this.cartService.getCart(userId);
  }

  @Get('total')
  async getCartTotal(@Request() req: any) {
    const userId = req.user.userId || req.user.sub;
    return this.cartService.getCartTotal(userId);
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
    const userId = req.user.userId || req.user.sub;
    return this.cartService.addItem(userId, addItemDto);
  }

  @Put('update/:itemId')
  async updateQuantity(
    @Request() req: any,
    @Param('itemId') itemId: string,
    @Body() body: { quantity: number },
  ) {
    const userId = req.user.userId || req.user.sub;
    return this.cartService.updateQuantity(itemId, userId, body.quantity);
  }

  @Delete('remove/:itemId')
  async removeItem(@Request() req: any, @Param('itemId') itemId: string) {
    const userId = req.user.userId || req.user.sub;
    return this.cartService.removeItem(itemId, userId);
  }

  @Delete('clear')
  async clearCart(@Request() req: any) {
    const userId = req.user.userId || req.user.sub;
    return this.cartService.clearCart(userId);
  }
}