import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Address } from './address.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Address)
    private addressesRepository: Repository<Address>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async getProfile(userId: string): Promise<Omit<User, 'password'>> {
    const user = await this.findById(userId);
    const { password, ...profile } = user;
    return profile;
  }

  async updateProfile(
    userId: string,
    updateProfileDto: {
      firstName?: string;
      lastName?: string;
      phone?: string;
    },
  ): Promise<Omit<User, 'password'>> {
    const user = await this.findById(userId);

    if (updateProfileDto.firstName) user.firstName = updateProfileDto.firstName;
    if (updateProfileDto.lastName) user.lastName = updateProfileDto.lastName;
    if (updateProfileDto.phone) user.phone = updateProfileDto.phone;

    const saved = await this.usersRepository.save(user);
    const { password, ...profile } = saved;
    return profile;
  }

  async changePassword(
    userId: string,
    changePasswordDto: {
      currentPassword: string;
      newPassword: string;
    },
  ): Promise<{ message: string }> {
    const user = await this.findById(userId);

    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    if (changePasswordDto.newPassword.length < 6) {
      throw new BadRequestException(
        'New password must be at least 6 characters',
      );
    }

    user.password = await bcrypt.hash(changePasswordDto.newPassword, 10);
    await this.usersRepository.save(user);

    return { message: 'Password changed successfully' };
  }

  async getAddresses(userId: string): Promise<Address[]> {
    return this.addressesRepository.find({
      where: { userId },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async addAddress(
    userId: string,
    addAddressDto: {
      label: string;
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      apartment?: string;
      phone?: string;
      isDefault?: boolean;
    },
  ): Promise<Address> {
    if (addAddressDto.isDefault) {
      await this.addressesRepository.update(
        { userId, isDefault: true },
        { isDefault: false },
      );
    }

    const address = this.addressesRepository.create({
      userId,
      ...addAddressDto,
    });
    return this.addressesRepository.save(address);
  }

  async updateAddress(
    userId: string,
    addressId: string,
    updateAddressDto: {
      label?: string;
      street?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
      apartment?: string;
      phone?: string;
      isDefault?: boolean;
    },
  ): Promise<Address> {
    const address = await this.addressesRepository.findOne({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    if (updateAddressDto.isDefault) {
      await this.addressesRepository.update(
        { userId, isDefault: true },
        { isDefault: false },
      );
    }

    Object.assign(address, updateAddressDto);
    return this.addressesRepository.save(address);
  }

  async deleteAddress(userId: string, addressId: string): Promise<void> {
    const result = await this.addressesRepository.delete({
      id: addressId,
      userId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('Address not found');
    }
  }

  async getDefaultAddress(userId: string): Promise<Address | null> {
    return this.addressesRepository.findOne({
      where: { userId, isDefault: true },
    });
  }
}
