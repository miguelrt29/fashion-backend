import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './favorite.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private favoritesRepository: Repository<Favorite>,
  ) {}

  async getAll(userId: string): Promise<Favorite[]> {
    return this.favoritesRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async add(
    userId: string,
    addFavoriteDto: {
      productId: string;
      name?: string;
      price?: number;
      image?: string;
      category?: string;
    },
  ): Promise<Favorite> {
    const existing = await this.favoritesRepository.findOne({
      where: { userId, productId: addFavoriteDto.productId },
    });

    if (existing) {
      throw new ConflictException('Product already in favorites');
    }

    const favorite = this.favoritesRepository.create({
      userId,
      ...addFavoriteDto,
    });
    return this.favoritesRepository.save(favorite);
  }

  async remove(favoriteId: string, userId: string): Promise<void> {
    const result = await this.favoritesRepository.delete({
      id: favoriteId,
      userId,
    });
    if (result.affected === 0) {
      throw new NotFoundException('Favorite not found');
    }
  }

  async checkIsFavorite(userId: string, productId: string): Promise<boolean> {
    const favorite = await this.favoritesRepository.findOne({
      where: { userId, productId },
    });
    return !!favorite;
  }

  async getFavoritesCount(userId: string): Promise<number> {
    return this.favoritesRepository.count({ where: { userId } });
  }
}