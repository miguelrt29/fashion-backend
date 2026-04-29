import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { AiModule } from './ai/ai.module';
import { MailModule } from './mail/mail.module';
import { User } from './users/user.entity';
import { Address } from './users/address.entity';
import { Product } from './products/product.entity';
import { Order } from './orders/order.entity';
import { CartModule } from './cart/cart.module';
import { CartItem } from './cart/cart.entity';
import { FavoritesModule } from './favorites/favorites.module';
import { Favorite } from './favorites/favorite.entity';
import { ReviewsModule } from './reviews/reviews.module';
import { Review } from './reviews/review.entity';
import { NewsletterModule } from './newsletter/newsletter.module';
import { NewsletterSubscriber } from './newsletter/newsletter-subscriber.entity';
import { CouponsModule } from './coupons/coupons.module';
import { Coupon } from './coupons/coupon.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        entities: [
          User,
          Address,
          Product,
          Order,
          CartItem,
          Favorite,
          Review,
          NewsletterSubscriber,
          Coupon,
        ],
        synchronize: config.get('NODE_ENV') !== 'production',
        logging: config.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),

    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    AuthModule,
    UsersModule,
    ProductsModule,
    OrdersModule,
    PaymentsModule,
    AiModule,
    MailModule,
    CartModule,
    FavoritesModule,
    ReviewsModule,
    NewsletterModule,
    CouponsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
