import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './review.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
  ) {}

  async getProductReviews(productId: string): Promise<Review[]> {
    return this.reviewsRepository.find({
      where: { productId, isApproved: true },
      order: { createdAt: 'DESC' },
    });
  }

  async getUserReviews(userId: string): Promise<Review[]> {
    return this.reviewsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async create(
    userId: string,
    userName: string,
    createReviewDto: {
      productId: string;
      rating: number;
      title?: string;
      comment?: string;
    },
  ): Promise<Review> {
    const existingReview = await this.reviewsRepository.findOne({
      where: { userId, productId: createReviewDto.productId },
    });

    if (existingReview) {
      throw new ForbiddenException('You have already reviewed this product');
    }

    const review = this.reviewsRepository.create({
      userId,
      userName,
      ...createReviewDto,
    });
    return this.reviewsRepository.save(review);
  }

  async update(
    reviewId: string,
    userId: string,
    updateReviewDto: {
      rating: number;
      title?: string;
      comment?: string;
    },
  ): Promise<Review> {
    const review = await this.reviewsRepository.findOne({
      where: { id: reviewId, userId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    review.rating = updateReviewDto.rating;
    if (updateReviewDto.title !== undefined)
      review.title = updateReviewDto.title;
    if (updateReviewDto.comment !== undefined)
      review.comment = updateReviewDto.comment;

    return this.reviewsRepository.save(review);
  }

  async delete(reviewId: string, userId: string): Promise<void> {
    const result = await this.reviewsRepository.delete({
      id: reviewId,
      userId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('Review not found');
    }
  }

  async getProductRating(productId: string): Promise<{
    average: number;
    count: number;
    distribution: number[];
  }> {
    const reviews = await this.reviewsRepository.find({
      where: { productId, isApproved: true },
    });

    const distribution = [0, 0, 0, 0, 0];
    reviews.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating - 1]++;
      }
    });

    if (reviews.length === 0) {
      return { average: 0, count: 0, distribution };
    }

    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return {
      average: total / reviews.length,
      count: reviews.length,
      distribution,
    };
  }

  async getAllPending(): Promise<Review[]> {
    return this.reviewsRepository.find({
      where: { isApproved: false },
      order: { createdAt: 'DESC' },
    });
  }

  async approveReview(reviewId: string): Promise<Review> {
    const review = await this.reviewsRepository.findOne({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    review.isApproved = true;
    return this.reviewsRepository.save(review);
  }
}
