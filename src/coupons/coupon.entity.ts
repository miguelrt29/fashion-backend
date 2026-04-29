import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('coupons')
export class Coupon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  type: 'percentage' | 'fixed';

  @Column('decimal', { precision: 10, scale: 2 })
  value: number;

  @Column({ nullable: true })
  minPurchase: number;

  @Column({ nullable: true })
  maxDiscount: number;

  @Column({ nullable: true })
  expiresAt: Date;

  @Column({ default: 1 })
  usageLimit: number;

  @Column({ default: 0 })
  usedCount: number;

  @Column('simple-array', { nullable: true })
  applicableCategories: string[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
