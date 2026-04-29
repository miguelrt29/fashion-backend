import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Coupon } from './coupon.entity';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private couponsRepository: Repository<Coupon>,
  ) {}

  async create(createCouponDto: {
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    minPurchase?: number;
    maxDiscount?: number;
    expiresAt?: Date;
    usageLimit?: number;
    applicableCategories?: string[];
  }): Promise<Coupon> {
    const { code, ...rest } = createCouponDto;
    const coupon = this.couponsRepository.create({
      code: code.toUpperCase(),
      ...rest,
    });
    return this.couponsRepository.save(coupon);
  }

  async validate(
    code: string,
    cartTotal: number,
    category?: string,
  ): Promise<{
    valid: boolean;
    discount: number;
    message?: string;
  }> {
    const coupon = await this.couponsRepository.findOne({
      where: { code: code.toUpperCase(), isActive: true },
    });

    if (!coupon) {
      return { valid: false, discount: 0, message: 'Invalid coupon code' };
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return { valid: false, discount: 0, message: 'Coupon has expired' };
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return {
        valid: false,
        discount: 0,
        message: 'Coupon usage limit reached',
      };
    }

    if (coupon.minPurchase && cartTotal < coupon.minPurchase) {
      return {
        valid: false,
        discount: 0,
        message: `Minimum purchase of $${coupon.minPurchase} required`,
      };
    }

    if (
      coupon.applicableCategories &&
      coupon.applicableCategories.length > 0 &&
      category &&
      !coupon.applicableCategories.includes(category)
    ) {
      return {
        valid: false,
        discount: 0,
        message: 'Coupon not applicable to this category',
      };
    }

    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = (cartTotal * Number(coupon.value)) / 100;
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else {
      discount = Number(coupon.value);
    }

    return { valid: true, discount };
  }

  async apply(code: string): Promise<Coupon> {
    const coupon = await this.couponsRepository.findOne({
      where: { code: code.toUpperCase(), isActive: true },
    });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    coupon.usedCount += 1;
    return this.couponsRepository.save(coupon);
  }

  async getAll(): Promise<Coupon[]> {
    return this.couponsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async getActive(): Promise<Coupon[]> {
    const now = new Date();
    return this.couponsRepository
      .createQueryBuilder('coupon')
      .where('coupon.isActive = :isActive', { isActive: true })
      .andWhere('coupon.expiresAt > :now OR coupon.expiresAt IS NULL', { now })
      .andWhere('coupon.usedCount < coupon.usageLimit')
      .orderBy('coupon.createdAt', 'DESC')
      .getMany();
  }

  async getById(id: string): Promise<Coupon> {
    const coupon = await this.couponsRepository.findOne({ where: { id } });
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }
    return coupon;
  }

  async update(
    id: string,
    updateCouponDto: {
      type?: 'percentage' | 'fixed';
      value?: number;
      minPurchase?: number;
      maxDiscount?: number;
      expiresAt?: Date;
      usageLimit?: number;
      applicableCategories?: string[];
      isActive?: boolean;
    },
  ): Promise<Coupon> {
    const coupon = await this.getById(id);
    Object.assign(coupon, updateCouponDto);
    return this.couponsRepository.save(coupon);
  }

  async delete(id: string): Promise<void> {
    const result = await this.couponsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Coupon not found');
    }
  }

  async toggleActive(id: string): Promise<Coupon> {
    const coupon = await this.getById(id);
    coupon.isActive = !coupon.isActive;
    return this.couponsRepository.save(coupon);
  }
}
