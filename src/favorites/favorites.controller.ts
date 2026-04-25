import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FavoritesService } from './favorites.service';

@Controller('favorites')
@UseGuards(AuthGuard('jwt'))
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  async getFavorites(@Request() req: any) {
    const userId = req.user.userId || req.user.sub;
    return this.favoritesService.getAll(userId);
  }

  @Get('check/:productId')
  async checkIsFavorite(
    @Request() req: any,
    @Param('productId') productId: string,
  ) {
    const userId = req.user.userId || req.user.sub;
    const isFavorite = await this.favoritesService.checkIsFavorite(userId, productId);
    return { isFavorite };
  }

  @Get('count')
  async getFavoritesCount(@Request() req: any) {
    const userId = req.user.userId || req.user.sub;
    const count = await this.favoritesService.getFavoritesCount(userId);
    return { count };
  }

  @Post('add')
  async addFavorite(
    @Request() req: any,
    @Body()
    addFavoriteDto: {
      productId: string;
      name?: string;
      price?: number;
      image?: string;
      category?: string;
    },
  ) {
    const userId = req.user.userId || req.user.sub;
    return this.favoritesService.add(userId, addFavoriteDto);
  }

  @Delete('remove/:favoriteId')
  async removeFavorite(
    @Request() req: any,
    @Param('favoriteId') favoriteId: string,
  ) {
    const userId = req.user.userId || req.user.sub;
    return this.favoritesService.remove(favoriteId, userId);
  }
}