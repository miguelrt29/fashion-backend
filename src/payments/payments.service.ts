import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class PaymentsService {
  private readonly stripeSecretKey: string;
  private readonly stripeWebhookSecret: string;
  private readonly mercadopagoAccessToken: string;
  private readonly mercadopagoWebhookSecret: string;

  constructor(
    private configService: ConfigService,
    private ordersService: OrdersService,
  ) {
    this.stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY') || '';
    this.stripeWebhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || '';
    this.mercadopagoAccessToken =
      this.configService.get<string>('MERCADOPAGO_ACCESS_TOKEN') || '';
    this.mercadopagoWebhookSecret = this.configService.get<string>(
      'MERCADOPAGO_WEBHOOK_SECRET',
    ) || '';
  }

  private getStripe() {
    if (!this.stripeSecretKey) {
      throw new BadRequestException(
        'Stripe no está configurado. Configure STRIPE_SECRET_KEY en el archivo .env',
      );
    }
    return require('stripe')(this.stripeSecretKey);
  }

  async createStripeSession(
    orderId: string,
    amount: number,
    userId: string,
  ): Promise<{ sessionId: string; url: string }> {
    const stripe = this.getStripe();

    const order = await this.ordersService.findOne(orderId, userId);

    const lineItems = order.items.map((item) => ({
      price_data: {
        currency: 'cop',
        product_data: {
          name: item.name,
          description: `Talla: ${item.size}, Color: ${item.color}`,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${this.configService.get('FRONTEND_URL')}/order-confirmation?orderId=${orderId}&status=success`,
      cancel_url: `${this.configService.get('FRONTEND_URL')}/checkout?orderId=${orderId}&status=cancelled`,
      customer_email: this.configService.get('user_email'),
      metadata: {
        orderId,
        userId,
      },
    });

    return { sessionId: session.id, url: session.url };
  }

  async createMercadoPagoPreference(
    orderId: string,
    items: Array<{
      productId: string;
      name: string;
      price: number;
      quantity: number;
      image?: string;
    }>,
    userId: string,
  ): Promise<{ preferenceId: string; initPoint: string }> {
    if (!this.mercadopagoAccessToken) {
      throw new BadRequestException(
        'MercadoPago no está configurado. Configure MERCADOPAGO_ACCESS_TOKEN en el archivo .env',
      );
    }

    await this.ordersService.findOne(orderId, userId);

    const mpItems = items.map((item) => ({
      title: item.name,
      quantity: item.quantity,
      unit_price: item.price,
      currency_id: 'COP',
    }));

    const response = await require('axios').post(
      'https://api.mercadopago.com/preferences',
      {
        items: mpItems,
        back_urls: {
          success: `${this.configService.get('FRONTEND_URL')}/order-confirmation?orderId=${orderId}&status=success`,
          failure: `${this.configService.get('FRONTEND_URL')}/checkout?orderId=${orderId}&status=cancelled`,
        },
        external_reference: orderId,
        metadata: {
          orderId,
          userId,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${this.mercadopagoAccessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return {
      preferenceId: response.data.id,
      initPoint: response.data.init_point,
    };
  }

  async handleStripeWebhook(
    payload: string,
    signature: string,
  ): Promise<{ received: boolean }> {
    const stripe = this.getStripe();

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        payload,
        signature,
        this.stripeWebhookSecret,
      );
    } catch {
      throw new BadRequestException('Firma de webhook inválida');
    }

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        if (session.metadata?.orderId) {
          await this.ordersService.updateStatus(session.metadata.orderId, 'confirmed');
        }
        break;
      case 'payment_intent.payment_failed':
        const paymentIntent = event.data.object;
        if (paymentIntent.metadata?.orderId) {
          await this.ordersService.updateStatus(
            paymentIntent.metadata.orderId,
            'cancelled',
          );
        }
        break;
    }

    return { received: true };
  }

  async handleMercadoPagoWebhook(data: {
    type: string;
    data: { id: string };
  }): Promise<{ received: boolean }> {
    if (data.type === 'payment') {
      const paymentId = data.data.id;
      if (paymentId) {
        try {
          const response = await require('axios').get(
            `https://api.mercadopago.com/v1/payments/${paymentId}`,
            {
              headers: {
                Authorization: `Bearer ${this.mercadopagoAccessToken}`,
              },
            },
          );
          const payment = response.data;
          const orderId = payment.external_reference;
          if (orderId && payment.status === 'approved') {
            await this.ordersService.updateStatus(orderId, 'confirmed');
          }
        } catch {}
      }
    }

    return { received: true };
  }

  async getPaymentStatus(paymentId: string): Promise<{
    paymentId: string;
    status: string;
  }> {
    if (!this.stripeSecretKey) {
      throw new BadRequestException('Stripe no está configurado');
    }

    const stripe = this.getStripe();
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);

    return {
      paymentId: paymentIntent.id,
      status: paymentIntent.status,
    };
  }
}