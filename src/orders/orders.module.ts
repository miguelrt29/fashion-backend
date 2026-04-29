import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from './order.entity';
import { Product } from '../products/product.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Product]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    AuthModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
