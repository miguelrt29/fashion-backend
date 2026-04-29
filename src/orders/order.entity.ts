import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column('jsonb')
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    size: string;
    color: string;
    image: string;
  }[];

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @Column({
    type: 'enum',
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  })
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

  @Column({ nullable: true })
  paymentId: string;

  @Column({
    type: 'enum',
    enum: ['stripe', 'mercadopago', 'cash'],
    nullable: true,
  })
  paymentMethod: 'stripe' | 'mercadopago' | 'cash';

  @Column('jsonb', { nullable: true })
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };

  @Column({ nullable: true })
  trackingNumber: string;

  @Column({ type: 'date', nullable: true })
  estimatedDelivery: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
