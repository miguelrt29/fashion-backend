import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Seguridad: Headers HTTP protegidos
  app.use(helmet());

  // Seguridad: CORS - solo permite llamadas desde el frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  // Seguridad: Validación global de todos los datos entrantes
  // Rechaza cualquier campo no permitido en los DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,        // Elimina campos no declarados en el DTO
      forbidNonWhitelisted: true, // Lanza error si llegan campos extra
      transform: true,        // Convierte tipos automáticamente
    }),
  );

  // Prefijo global para todas las rutas: /api/productos, /api/usuarios, etc.
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Fashion Store API corriendo en: http://localhost:${port}/api`);
}

bootstrap();