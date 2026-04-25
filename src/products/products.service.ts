import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async findAll(gender?: string, category?: string, search?: string) {
    const query = this.productRepository.createQueryBuilder('product')
      .where('product.isActive = :isActive', { isActive: true });

    if (gender) {
      query.andWhere('product.gender = :gender', { gender });
    }

    if (category) {
      query.andWhere('product.category = :category', { category });
    }

    if (search) {
      query.andWhere(
        'LOWER(product.name) LIKE :search OR LOWER(product.description) LIKE :search',
        { search: `%${search.toLowerCase()}%` },
      );
    }

    return query.orderBy('product.createdAt', 'DESC').getMany();
  }

  async findOne(id: string) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  async create(data: Partial<Product>) {
    const product = this.productRepository.create(data);
    return this.productRepository.save(product);
  }

  async update(id: string, data: Partial<Product>) {
    await this.findOne(id);
    await this.productRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.productRepository.update(id, { isActive: false });
    return { message: 'Producto eliminado correctamente' };
  }
}