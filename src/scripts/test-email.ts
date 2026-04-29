import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
dotenv.config();

async function testEmail() {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  try {
    await transporter.verify();
    console.log('✅ Conexión SMTP verificada');

    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: process.env.MAIL_USER,
      subject: 'Test FashionStore',
      text: 'Email de prueba funcionando',
    });
    console.log('✅ Email enviado exitosamente');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testEmail();
