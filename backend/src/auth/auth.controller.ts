import {
    Body,
    Controller,
    Get,
    Headers,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    UseGuards,
  } from '@nestjs/common';
  
  import { AuthService } from './auth.service';
  
  import type {
    AuthenticatedRequest,
  } from './auth.types';
  
  import { LoginDto } from './dto/login.dto';
  import { RefreshTokenDto } from './dto/refresh-token.dto';
  import { RegisterDto } from './dto/register.dto';
  
  import { AccessTokenGuard } from './guards/access-token.guard';
  import { ChangePasswordDto } from './dto/change-password.dto';

  @Controller('auth')
  export class AuthController {
    constructor(
      private readonly authService:
        AuthService,
    ) {}
  
    @Post('register')
    async register(
      @Body() dto: RegisterDto,
  
      @Headers('user-agent')
      userAgent?: string,
    ) {
      const data =
        await this.authService.register(
          dto,
          userAgent,
        );
  
      return {
        data,
      };
    }
  
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
      @Body() dto: LoginDto,
  
      @Headers('user-agent')
      userAgent?: string,
    ) {
      const data =
        await this.authService.login(
          dto,
          userAgent,
        );
  
      return {
        data,
      };
    }
  
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(
      @Body() dto: RefreshTokenDto,
    ) {
      const data =
        await this.authService.refresh(
          dto.refreshToken,
        );
  
      return {
        data,
      };
    }
  
    @Get('me')
    @UseGuards(AccessTokenGuard)
    async me(
      @Req()
      request: AuthenticatedRequest,
    ) {
      const data =
        await this.authService
          .getCurrentUser(
            request.auth.sub,
          );
  
      return {
        data,
      };
    }
    @Get('sessions')
@UseGuards(AccessTokenGuard)
async sessions(
  @Req()
  request: AuthenticatedRequest,
) {
  return {
    data:
      await this.authService
        .getSessions(
          request.auth.sub,
          request.auth.sid,
        ),
  };
}

@Post('logout')
@HttpCode(HttpStatus.NO_CONTENT)
@UseGuards(AccessTokenGuard)
async logout(
  @Req()
  request: AuthenticatedRequest,
): Promise<void> {
  await this.authService.logout(
    request.auth.sub,
    request.auth.sid,
  );
}

@Post('logout-all')
@HttpCode(HttpStatus.NO_CONTENT)
@UseGuards(AccessTokenGuard)
async logoutAll(
  @Req()
  request: AuthenticatedRequest,
): Promise<void> {
  await this.authService.logoutAll(
    request.auth.sub,
  );
}
@Post('change-password')
@HttpCode(HttpStatus.NO_CONTENT)
@UseGuards(AccessTokenGuard)
async changePassword(
  @Req()
  request: AuthenticatedRequest,

  @Body()
  dto: ChangePasswordDto,
): Promise<void> {
  await this.authService.changePassword(
    request.auth.sub,
    request.auth.sid,
    dto.currentPassword,
    dto.newPassword,
  );
}
  }