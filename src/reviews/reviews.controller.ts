import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('product/:productId')
  async getProductReviews(@Param('productId') productId: string) {
    return this.reviewsService.getProductReviews(productId);
  }

  @Get('product/:productId/rating')
  async getProductRating(@Param('productId') productId: string) {
    return this.reviewsService.getProductRating(productId);
  }

  @Get('my-reviews')
  @UseGuards(AuthGuard('jwt'))
  async getUserReviews(@Request() req: any) {
    return this.reviewsService.getUserReviews(req.user.userId);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async createReview(
    @Request() req: any,
    @Body()
    createReviewDto: {
      productId: string;
      rating: number;
      title?: string;
      comment?: string;
    },
  ) {
    return this.reviewsService.create(
      req.user.userId,
      req.user.user?.firstName || 'Anonymous',
      createReviewDto,
    );
  }

  @Put(':reviewId')
  @UseGuards(AuthGuard('jwt'))
  async updateReview(
    @Request() req: any,
    @Param('reviewId') reviewId: string,
    @Body()
    updateReviewDto: {
      rating: number;
      title?: string;
      comment?: string;
    },
  ) {
    return this.reviewsService.update(reviewId, req.user.userId, updateReviewDto);
  }

  @Delete(':reviewId')
  @UseGuards(AuthGuard('jwt'))
  async deleteReview(@Request() req: any, @Param('reviewId') reviewId: string) {
    return this.reviewsService.delete(reviewId, req.user.userId);
  }

  @Get('admin/pending')
  @UseGuards(AuthGuard('jwt'))
  async getPendingReviews(@Request() req: any) {
    return this.reviewsService.getAllPending();
  }

  @Put('admin/approve/:reviewId')
  @UseGuards(AuthGuard('jwt'))
  async approveReview(@Param('reviewId') reviewId: string) {
    return this.reviewsService.approveReview(reviewId);
  }
}