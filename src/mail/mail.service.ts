import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  firstName?: string;
}

@Injectable()
export class MailService {
  private readonly resendApiKey: string | undefined;
  private readonly from: string;
  private readonly frontendUrl: string;

  constructor(private configService: ConfigService) {
    this.resendApiKey = configService.get<string>('RESEND_API_KEY');
    this.from =
      configService.get('MAIL_FROM') || 'FashionStore <onboarding@resend.dev>';
    this.frontendUrl = configService.get('FRONTEND_URL') || 'http://localhost:4200';
  }

  private async sendViaResend(to: string, subject: string, html: string) {
    await axios.post(
      'https://api.resend.com/emails',
      { from: this.from, to, subject, html },
      {
        headers: {
          Authorization: `Bearer ${this.resendApiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      },
    );
  }

  private async sendEmail(options: { to: string; subject: string; html: string }) {
    if (this.resendApiKey) {
      await this.sendViaResend(options.to, options.subject, options.html);
    } else {
      console.log('📧 [DEV] Email no enviado — RESEND_API_KEY no configurado');
      console.log(`  To: ${options.to}`);
      console.log(`  Subject: ${options.subject}`);
    }
  }

  async sendWelcomeEmail(user: User) {
    console.log('Intentando enviar email de bienvenida a:', user.email);
    try {
      await this.sendEmail({
        to: user.email,
        subject: 'Bienvenido a FashionStore',
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a1a1a;">¡Bienvenido a FashionStore!</h1>
          <p>Hola ${user.firstName || 'Usuario'},</p>
          <p>Gracias por registrarte en FashionStore. Tu cuenta ha sido creada exitosamente.</p>
          <p>Ahora puedes:</p>
          <ul>
            <li>Explorar nuestra colección de moda</li>
            <li>Guardar tus productos favoritos</li>
            <li>Realizar compras seguras</li>
            <li>Recibir ofertas exclusivas</li>
          </ul>
          <p>¡Empieza a comprar hoy!</p>
          <a href="${this.frontendUrl}/products" 
             style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; display: inline-block;">
            Ver Productos
          </a>
          <p style="margin-top: 30px; color: #666; font-size: 12px;">
            © ${new Date().getFullYear()} FashionStore. Todos los derechos reservados.
          </p>
        </div>
        `,
      });
      console.log(`✅ Email de bienvenida enviado exitosamente a ${user.email}`);
    } catch (error) {
      console.error(`❌ Error enviando email de bienvenida:`, error.message);
    }
  }

  async sendPasswordResetEmail(user: User, resetToken: string) {
    console.log('Intentando enviar email de recuperación a:', user.email);
    const resetUrl = `${this.frontendUrl}/reset-password?token=${resetToken}`;

    try {
      await this.sendEmail({
        to: user.email,
        subject: 'Recuperar tu contraseña - FashionStore',
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a1a1a;">Recuperar Contraseña</h1>
          <p>Hola ${user.firstName || 'Usuario'},</p>
          <p>Recibimos una solicitud para restablecer tu contraseña.</p>
          <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
          <a href="${resetUrl}" 
             style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; display: inline-block;">
            Restablecer Contraseña
          </a>
          <p style="margin-top: 20px;">Este enlace expire en 1 hora.</p>
          <p style="color: #666; font-size: 12px;">
            Si no solicitaste este cambio, puedes ignorar este email.
          </p>
          <p style="margin-top: 30px; color: #666; font-size: 12px;">
            © ${new Date().getFullYear()} FashionStore. Todos los derechos reservados.
          </p>
        </div>
        `,
      });
      console.log(`✅ Email de recuperación enviado exitosamente a ${user.email}`);
    } catch (error) {
      console.error(`❌ Error enviando email de recuperación:`, error.message);
    }
  }

  async sendOrderConfirmation(user: User, orderId: string, total: number) {
    try {
      await this.sendEmail({
        to: user.email,
        subject: `Confirmación de tu orden #${orderId} - FashionStore`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a1a1a;">¡Gracias por tu compra!</h1>
          <p>Hola ${user.firstName || 'Usuario'},</p>
          <p>Tu orden ha sido confirmada exitosamente.</p>
          <div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
            <p><strong>Número de orden:</strong> ${orderId}</p>
            <p><strong>Total:</strong> $${total.toLocaleString('es-CO')}</p>
          </div>
          <p>Puedes seguir el estado de tu orden en tu cuenta.</p>
          <a href="${this.frontendUrl}/profile?tab=orders" 
             style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; display: inline-block;">
            Ver Mi Orden
          </a>
          <p style="margin-top: 30px; color: #666; font-size: 12px;">
            © ${new Date().getFullYear()} FashionStore. Todos los derechos reservados.
          </p>
        </div>
        `,
      });
      console.log(`✅ Email de confirmación enviado a ${user.email}`);
    } catch (error) {
      console.error(`❌ Error enviando email de confirmación:`, error.message);
    }
  }
}
