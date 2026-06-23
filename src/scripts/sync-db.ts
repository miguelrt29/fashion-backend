import { DataSource } from 'typeorm';
import { User } from '../users/user.entity';
import { Address } from '../users/address.entity';
import { Product } from '../products/product.entity';
import { Order } from '../orders/order.entity';
import { CartItem } from '../cart/cart.entity';
import { Favorite } from '../favorites/favorite.entity';
import { Review } from '../reviews/review.entity';
import { NewsletterSubscriber } from '../newsletter/newsletter-subscriber.entity';
import { Coupon } from '../coupons/coupon.entity';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('ERROR: DATABASE_URL no configurada');
  process.exit(1);
}

const AppDataSource = new DataSource({
  type: 'postgres',
  url: databaseUrl,
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
  ssl: { rejectUnauthorized: false },
  synchronize: true,
});

async function sync() {
  console.log('Conectando a Supabase...');
  await AppDataSource.initialize();
  console.log('✅ Conexión establecida');
  console.log('Tablas sincronizadas correctamente');
  await AppDataSource.destroy();
  console.log('✅ Listo');
}

sync().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
