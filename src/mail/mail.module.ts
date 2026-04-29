import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get('MAIL_HOST') || 'smtp.gmail.com',
          port: parseInt(configService.get('MAIL_PORT') || '587'),
          secure: false,
          tls: {
            rejectUnauthorized: false,
          },
          auth: {
            user: configService.get('MAIL_USER'),
            pass: configService.get('MAIL_PASS'),
          },
        },
        defaults: {
          from:
            configService.get('MAIL_FROM') ||
            'FashionStore <noreply@fashionstore.com>',
        },
      }),
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
