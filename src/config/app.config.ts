import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  env: process.env['NODE_ENV'] ?? 'development',
  port: parseInt(process.env['PORT'] ?? '3000'),
  frontendUrl: process.env['FRONTEND_URL'] ?? 'http://localhost:4200',
  
  database: {
    url: process.env['DATABASE_URL'],
    host: process.env['DB_HOST'],
    port: parseInt(process.env['DB_PORT'] ?? '5432'),
    username: process.env['DB_USERNAME'],
    password: process.env['DB_PASSWORD'],
    name: process.env['DB_NAME'],
  },
  
  jwt: {
    secret: process.env['JWT_SECRET'],
    expiresIn: process.env['JWT_EXPIRES_IN'] ?? '15m',
  },
  
  stripe: {
    secretKey: process.env['STRIPE_SECRET_KEY'],
    webhookSecret: process.env['STRIPE_WEBHOOK_SECRET'],
  },
  
  mercadopago: {
    accessToken: process.env['MERCADOPAGO_ACCESS_TOKEN'],
    webhookSecret: process.env['MERCADOPAGO_WEBHOOK_SECRET'],
  },
  
  ai: {
    huggingFaceApiKey: process.env['HUGGING_FACE_API_KEY'],
  },
}));