import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import * as dotenv from 'dotenv';
dotenv.config();

async function testForgotPassword() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const authService = app.get('AuthService');

  console.log('Probando forgotPassword para: miguelrt2903@gmail.com');

  try {
    const result = await authService.forgotPassword('miguelrt2903@gmail.com');
    console.log('Resultado:', result);
  } catch (error) {
    console.error('Error:', error.message);
  }

  await app.close();
}

testForgotPassword();
