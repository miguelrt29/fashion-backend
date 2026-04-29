import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';

@Injectable()
export class ProductsService {
  private readonly backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  private normalizeImages(images: string[]): string[] {
    return (images || []).map(img => {
      if (!img) return '';
      if (img.startsWith('http://') || img.startsWith('https://')) {
        return img;
      }
      const cleanPath = img.startsWith('/') ? img : `/${img}`;
      return `${this.backendUrl}${cleanPath}`;
    }).filter(Boolean);
  }

  async findAll(gender?: string, category?: string, search?: string) {
    const query = this.productRepository
      .createQueryBuilder('product')
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

    const products = await query.orderBy('product.createdAt', 'DESC').getMany();
    return products.map(p => ({
      ...p,
      images: this.normalizeImages(p.images),
    }));
  }

  async findOne(id: string) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return {
      ...product,
      images: this.normalizeImages(product.images),
    };
  }

  async create(data: Partial<Product>) {
    const product = this.productRepository.create(data);
    const saved = await this.productRepository.save(product);
    return {
      ...saved,
      images: this.normalizeImages(saved.images),
    };
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
