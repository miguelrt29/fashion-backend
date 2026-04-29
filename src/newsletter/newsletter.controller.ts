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
import { NewsletterService } from './newsletter.service';

@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post('subscribe')
  async subscribe(@Body() body: { email: string }) {
    return this.newsletterService.subscribe(body.email);
  }

  @Post('unsubscribe')
  async unsubscribe(@Body() body: { email: string }) {
    return this.newsletterService.unsubscribe(body.email);
  }

  @Get('check/:email')
  async checkSubscription(@Param('email') email: string) {
    return this.newsletterService.checkSubscription(email);
  }

  @Get('subscribers')
  @UseGuards(AuthGuard('jwt'))
  async getSubscribers() {
    return this.newsletterService.getAllSubscribers();
  }

  @Get('count')
  @UseGuards(AuthGuard('jwt'))
  async getSubscribersCount() {
    const count = await this.newsletterService.getSubscribersCount();
    return { count };
  }
}
