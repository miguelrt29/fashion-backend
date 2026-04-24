import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('favorites')
@Unique(['userId', 'productId'])
export class Favorite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column()
  productId: string;

  @Column({ nullable: true })
  name: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  category: string;

  @CreateDateColumn()
  createdAt: Date;
}