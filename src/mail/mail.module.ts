import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const user = configService.get('MAIL_USER');
        const pass = configService.get('MAIL_PASS');
        const port = parseInt(configService.get('MAIL_PORT') || '587');
        const transport: any = {
          host: configService.get('MAIL_HOST') || 'smtp.gmail.com',
          port,
          secure: port === 465,
          tls: { rejectUnauthorized: false },
          connectionTimeout: 10000,
          greetingTimeout: 10000,
        };
        if (user && pass) {
          transport.auth = { user, pass };
        } else {
          console.warn('⚠️  MAIL_USER/MAIL_PASS no configurados — emails no se enviarán');
        }
        return {
          transport,
          defaults: {
            from: configService.get('MAIL_FROM') || 'FashionStore <noreply@fashionstore.com>',
          },
        };
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
