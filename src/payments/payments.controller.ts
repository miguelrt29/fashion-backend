import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Headers,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaymentsService } from './payments.service';
import {
  CreateStripePaymentDto,
  CreateMercadoPagoPaymentDto,
} from './dto/payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('stripe/create')
  @UseGuards(AuthGuard('jwt'))
  async createStripePayment(
    @Request() req,
    @Body() createPaymentDto: CreateStripePaymentDto,
  ) {
    return this.paymentsService.createStripeSession(
      createPaymentDto.orderId,
      createPaymentDto.amount,
      req.user.userId,
    );
  }

  @Post('mercadopago/create')
  @UseGuards(AuthGuard('jwt'))
  async createMercadoPagoPayment(
    @Request() req,
    @Body() createPaymentDto: CreateMercadoPagoPaymentDto,
  ) {
    return this.paymentsService.createMercadoPagoPreference(
      createPaymentDto.orderId,
      createPaymentDto.items,
      req.user.userId,
    );
  }

  @Post('stripe/webhook')
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Body() body: any,
  ) {
    const rawBody = JSON.stringify(body);
    return this.paymentsService.handleStripeWebhook(rawBody, signature);
  }

  @Post('mercadopago/webhook')
  async handleMercadoPagoWebhook(@Body() data: any) {
    return this.paymentsService.handleMercadoPagoWebhook(data);
  }

  @Get(':id/status')
  @UseGuards(AuthGuard('jwt'))
  async getPaymentStatus(@Param('id') paymentId: string) {
    return this.paymentsService.getPaymentStatus(paymentId);
  }
}
