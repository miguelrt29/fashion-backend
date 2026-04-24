import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from '../users/user.entity';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async register(email: string, password: string, firstName: string, lastName: string) {
    const exists = await this.userRepository.findOne({ where: { email } });
    if (exists) throw new ConflictException('El email ya está registrado');

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });

    await this.userRepository.save(user);

    this.mailService.sendWelcomeEmail({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
    }).catch(err => console.error('Error sending welcome email:', err.message));

    const { password: _, ...result } = user;
    return result;
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('Credenciales incorrectas');

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new UnauthorizedException('Credenciales incorrectas');

    const payload = { sub: user.id, userId: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    const { password: _, ...userData } = user;
    return { access_token: token, user: userData };
  }

  async validateToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Token inválido');
    }
  }

  async forgotPassword(email: string) {
    console.log('=== forgotPassword iniciado ===');
    const user = await this.userRepository.findOne({ where: { email } });
    console.log('Usuario encontrado:', user ? user.email : 'NO ENCONTRADO');
    
    if (!user) {
      return { message: 'Si el email existe, recibirás un enlace para recuperar tu contraseña' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000);
    console.log('Token generado:', resetToken);

    await this.userRepository.update(user.id, {
      resetToken,
      resetTokenExpiry,
    });
    console.log('Token guardado en BD');

    console.log('Enviando email de recuperación...');
    try {
      await this.mailService.sendPasswordResetEmail({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
      }, resetToken);
      console.log('Email de recuperación ENVIADO');
    } catch (err) {
      console.error('Error enviando reset email:', err.message);
    }

    return { message: 'Si el email existe, recibirás un enlace para recuperar tu contraseña' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.userRepository.findOne({
      where: {
        resetToken: token,
      },
    });

    if (!user) {
      throw new BadRequestException('Token de recuperación inválido');
    }

    if (user.resetTokenExpiry && new Date(user.resetTokenExpiry) < new Date()) {
      throw new BadRequestException('El token ha expirado');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await this.userRepository.update(user.id, {
      password: hashedPassword,
      resetToken: null as any,
      resetTokenExpiry: null as any,
    });

    return { message: 'Contraseña actualizada correctamente' };
  }
}