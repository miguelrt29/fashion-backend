import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@Request() req: any) {
    return this.usersService.getProfile(req.user.userId);
  }

  @Put('profile')
  async updateProfile(
    @Request() req: any,
    @Body()
    updateProfileDto: {
      firstName?: string;
      lastName?: string;
      phone?: string;
    },
  ) {
    return this.usersService.updateProfile(req.user.userId, updateProfileDto);
  }

  @Put('password')
  async changePassword(
    @Request() req: any,
    @Body()
    changePasswordDto: {
      currentPassword: string;
      newPassword: string;
    },
  ) {
    return this.usersService.changePassword(req.user.userId, changePasswordDto);
  }

  @Get('addresses')
  async getAddresses(@Request() req: any) {
    return this.usersService.getAddresses(req.user.userId);
  }

  @Get('addresses/default')
  async getDefaultAddress(@Request() req: any) {
    return this.usersService.getDefaultAddress(req.user.userId);
  }

  @Post('addresses')
  async addAddress(
    @Request() req: any,
    @Body()
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
  ) {
    return this.usersService.addAddress(req.user.userId, addAddressDto);
  }

  @Put('addresses/:addressId')
  async updateAddress(
    @Request() req: any,
    @Param('addressId') addressId: string,
    @Body()
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
  ) {
    return this.usersService.updateAddress(
      req.user.userId,
      addressId,
      updateAddressDto,
    );
  }

  @Delete('addresses/:addressId')
  async deleteAddress(
    @Request() req: any,
    @Param('addressId') addressId: string,
  ) {
    return this.usersService.deleteAddress(req.user.userId, addressId);
  }
}
