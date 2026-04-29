import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './cart.entity';

@Injectable()
export class CartService {
  private readonly backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';

  constructor(
    @InjectRepository(CartItem)
    private cartRepository: Repository<CartItem>,
  ) {}

  private normalizeImage(image: string): string {
    if (!image) return '';
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return image;
    }
    const cleanPath = image.startsWith('/') ? image : `/${image}`;
    return `${this.backendUrl}${cleanPath}`;
  }

  async getCart(userId: string): Promise<CartItem[]> {
    const items = await this.cartRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return items.map(item => ({
      ...item,
      image: this.normalizeImage(item.image),
    }));
  }

  async addItem(
    userId: string,
    addItemDto: {
      productId: string;
      name: string;
      price: number;
      quantity: number;
      size?: string;
      color?: string;
      image?: string;
    },
  ): Promise<CartItem> {
    const existingItem = await this.cartRepository.findOne({
      where: {
        userId,
        productId: addItemDto.productId,
        size: addItemDto.size,
        color: addItemDto.color,
      },
    });

    if (existingItem) {
      existingItem.quantity += addItemDto.quantity;
      return this.cartRepository.save(existingItem);
    }

    const cartItem = this.cartRepository.create({
      userId,
      ...addItemDto,
    });
    return this.cartRepository.save(cartItem);
  }

  async updateQuantity(
    itemId: string,
    userId: string,
    quantity: number,
  ): Promise<CartItem | void> {
    const item = await this.cartRepository.findOne({
      where: { id: itemId, userId },
    });

    if (!item) {
      throw new NotFoundException('Item not found in cart');
    }

    if (quantity <= 0) {
      await this.removeItem(itemId, userId);
      return;
    }

    item.quantity = quantity;
    return this.cartRepository.save(item);
  }

  async removeItem(itemId: string, userId: string): Promise<void> {
    const result = await this.cartRepository.delete({ id: itemId, userId });
    if (result.affected === 0) {
      throw new NotFoundException('Item not found in cart');
    }
  }

  async clearCart(userId: string): Promise<void> {
    await this.cartRepository.delete({ userId });
  }

  async getCartTotal(
    userId: string,
  ): Promise<{ total: number; items: number }> {
    const items = await this.getCart(userId);
    const total = items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0,
    );
    return {
      total,
      items: items.reduce((sum, item) => sum + item.quantity, 0),
    };
  }
}
