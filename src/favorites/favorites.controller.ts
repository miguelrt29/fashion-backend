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
    return this.favoritesService.getAll(req.user.userId);
  }

  @Get('check/:productId')
  async checkIsFavorite(
    @Request() req: any,
    @Param('productId') productId: string,
  ) {
    const isFavorite = await this.favoritesService.checkIsFavorite(
      req.user.userId,
      productId,
    );
    return { isFavorite };
  }

  @Get('count')
  async getFavoritesCount(@Request() req: any) {
    const count = await this.favoritesService.getFavoritesCount(req.user.userId);
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
    return this.favoritesService.add(req.user.userId, addFavoriteDto);
  }

  @Delete('remove/:favoriteId')
  async removeFavorite(
    @Request() req: any,
    @Param('favoriteId') favoriteId: string,
  ) {
    return this.favoritesService.remove(favoriteId, req.user.userId);
  }
}