import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsletterSubscriber } from './newsletter-subscriber.entity';

@Injectable()
export class NewsletterService {
  constructor(
    @InjectRepository(NewsletterSubscriber)
    private subscribersRepository: Repository<NewsletterSubscriber>,
  ) {}

  async subscribe(email: string): Promise<NewsletterSubscriber> {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException('Invalid email format');
    }

    const existing = await this.subscribersRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      if (existing.isActive) {
        throw new ConflictException('Email already subscribed');
      }
      existing.isActive = true;
      return this.subscribersRepository.save(existing);
    }

    const subscriber = this.subscribersRepository.create({
      email: email.toLowerCase(),
      isActive: true,
    });
    return this.subscribersRepository.save(subscriber);
  }

  async unsubscribe(email: string): Promise<{ message: string }> {
    const subscriber = await this.subscribersRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!subscriber) {
      throw new NotFoundException('Email not found in subscribers');
    }

    subscriber.isActive = false;
    await this.subscribersRepository.save(subscriber);

    return { message: 'Unsubscribed successfully' };
  }

  async getAllSubscribers(): Promise<NewsletterSubscriber[]> {
    return this.subscribersRepository.find({
      where: { isActive: true },
      order: { subscribedAt: 'DESC' },
    });
  }

  async checkSubscription(email: string): Promise<{ subscribed: boolean }> {
    const subscriber = await this.subscribersRepository.findOne({
      where: { email: email.toLowerCase(), isActive: true },
    });
    return { subscribed: !!subscriber };
  }

  async getSubscribersCount(): Promise<number> {
    return this.subscribersRepository.count({ where: { isActive: true } });
  }
}
