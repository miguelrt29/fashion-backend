import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../products/product.entity';
import { CreateOrderDto } from './dto/order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(userId: string, createOrderDto: CreateOrderDto): Promise<Order> {
    for (const item of createOrderDto.items) {
      const product = await this.productRepository.findOne({
        where: { id: item.productId },
      });
      if (!product) {
        throw new NotFoundException(`Producto ${item.productId} no encontrado`);
      }
      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Stock insuficiente para ${product.name}. Disponible: ${product.stock}`,
        );
      }
      await this.productRepository.update(item.productId, {
        stock: product.stock - item.quantity,
      });
    }

    const order = this.orderRepository.create({
      userId,
      items: createOrderDto.items,
      total: createOrderDto.total,
      status: 'pending',
      paymentMethod: createOrderDto.paymentMethod,
      shippingAddress: createOrderDto.shippingAddress,
      trackingNumber: this.generateTrackingNumber(),
      estimatedDelivery: this.calculateEstimatedDelivery(),
    });

    return this.orderRepository.save(order);
  }

  async findAllByUser(userId: string): Promise<Order[]> {
    return this.orderRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id, userId },
    });
    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }
    return order;
  }

  async getTracking(
    id: string,
    userId: string,
  ): Promise<{
    orderId: string;
    status: string;
    trackingNumber: string;
    estimatedDelivery: Date;
    history: { status: string; date: Date }[];
  }> {
    const order = await this.findOne(id, userId);
    const history = this.generateTrackingHistory(order.status, order.createdAt);

    return {
      orderId: order.id,
      status: order.status,
      trackingNumber: order.trackingNumber || 'No disponible',
      estimatedDelivery: order.estimatedDelivery,
      history,
    };
  }

  async updateStatus(id: string, status: string): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }
    order.status = status as Order['status'];
    return this.orderRepository.save(order);
  }

  async cancel(id: string, userId: string): Promise<Order> {
    const order = await this.findOne(id, userId);

    if (order.status !== 'pending') {
      throw new ForbiddenException(
        'No se puede cancelar una orden que ya fue confirmada o enviada',
      );
    }

    for (const item of order.items) {
      const product = await this.productRepository.findOne({
        where: { id: item.productId },
      });
      if (product) {
        await this.productRepository.update(item.productId, {
          stock: product.stock + item.quantity,
        });
      }
    }

    order.status = 'cancelled';
    return this.orderRepository.save(order);
  }

  private generateTrackingNumber(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'FS-';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private calculateEstimatedDelivery(): Date {
    const delivery = new Date();
    delivery.setDate(delivery.getDate() + 5);
    return delivery;
  }

  private generateTrackingHistory(
    currentStatus: string,
    createdAt: Date,
  ): { status: string; date: Date }[] {
    const history: { status: string; date: Date }[] = [];
    const statuses = ['pending', 'confirmed', 'shipped', 'delivered'];
    const statusIndex = statuses.indexOf(currentStatus);

    for (let i = 0; i <= statusIndex && i < statuses.length; i++) {
      history.push({
        status: statuses[i],
        date: new Date(createdAt.getTime() + i * 24 * 60 * 60 * 1000),
      });
    }

    return history;
  }
}
