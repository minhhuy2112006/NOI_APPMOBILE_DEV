import {
    Body,
    Controller,
    Get,
    Patch,
    Req,
    UseGuards,
  } from '@nestjs/common';
  
  import type {
    AuthenticatedRequest,
  } from '../auth/auth.types';
  
  import { AccessTokenGuard } from '../auth/guards/access-token.guard';
  
  import { UpdateProfileDto } from './dto/update-profile.dto';
  import { UpdateSettingsDto } from './dto/update-settings.dto';
  import { UsersService } from './users.service';
  
  @Controller('me')
  @UseGuards(AccessTokenGuard)
  export class UsersController {
    constructor(
      private readonly usersService:
        UsersService,
    ) {}
  
    @Get('profile')
    async profile(
      @Req()
      request: AuthenticatedRequest,
    ) {
      return {
        data:
          await this.usersService
            .getProfile(
              request.auth.sub,
            ),
      };
    }
  
    @Patch('profile')
    async updateProfile(
      @Req()
      request: AuthenticatedRequest,
  
      @Body()
      dto: UpdateProfileDto,
    ) {
      return {
        data:
          await this.usersService
            .updateProfile(
              request.auth.sub,
              dto,
            ),
      };
    }
  
    @Get('settings')
    async settings(
      @Req()
      request: AuthenticatedRequest,
    ) {
      return {
        data:
          await this.usersService
            .getSettings(
              request.auth.sub,
            ),
      };
    }
  
    @Patch('settings')
    async updateSettings(
      @Req()
      request: AuthenticatedRequest,
  
      @Body()
      dto: UpdateSettingsDto,
    ) {
      return {
        data:
          await this.usersService
            .updateSettings(
              request.auth.sub,
              dto,
            ),
      };
    }
  }