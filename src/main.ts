import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env') });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import compression from 'compression';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Seguridad: Headers HTTP protegidos
  app.use(helmet());

  // Performance: Compresión de respuestas gzip
  app.use(compression());

  // Seguridad: CORS - permite frontend en Vercel y localhost
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      const allowed = [
        'http://localhost:4200',
        process.env.FRONTEND_URL,
      ].filter(Boolean);
      if (!origin || allowed.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  // Servir archivos estáticos (imágenes)
  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

  // Seguridad: Validación global de todos los datos entrantes
  // Rechaza cualquier campo no permitido en los DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina campos no declarados en el DTO
      forbidNonWhitelisted: true, // Lanza error si llegan campos extra
      transform: true, // Convierte tipos automáticamente
    }),
  );

  // Prefijo global para todas las rutas: /api/productos, /api/usuarios, etc.
  app.setGlobalPrefix('api');

  // Health check en la raíz (sin prefijo /api)
  app.getHttpAdapter().get('/', (_req, res) => {
    res.json({ message: 'Fashion Backend API is running', status: 'ok' });
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(
    `🚀 Fashion Store API corriendo en: http://localhost:${port}/api`,
  );
}

void bootstrap();
