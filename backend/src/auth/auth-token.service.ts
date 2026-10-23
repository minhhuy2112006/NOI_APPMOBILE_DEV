import {
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  import { ConfigService } from '@nestjs/config';
  import { JwtService } from '@nestjs/jwt';
  
  import type {
    AccessTokenPayload,
    RefreshTokenPayload,
    TokenPair,
    UserRole,
  } from './auth.types';
  
  @Injectable()
  export class AuthTokenService {
    constructor(
      private readonly jwt: JwtService,
      private readonly config: ConfigService,
    ) {}
  
    async createTokenPair(params: {
      userId: string;
      sessionId: string;
      email: string;
      role: UserRole;
    }): Promise<TokenPair> {
      const accessSecret =
        this.config.getOrThrow<string>(
          'JWT_ACCESS_SECRET',
        );
  
      const refreshSecret =
        this.config.getOrThrow<string>(
          'JWT_REFRESH_SECRET',
        );
  
      const accessTtl =
        this.config.getOrThrow<number>(
          'JWT_ACCESS_TTL_SECONDS',
        );
  
      const refreshTtl =
        this.config.getOrThrow<number>(
          'JWT_REFRESH_TTL_SECONDS',
        );
  
      const issuer =
        this.config.getOrThrow<string>(
          'JWT_ISSUER',
        );
  
      const audience =
        this.config.getOrThrow<string>(
          'JWT_AUDIENCE',
        );
  
      const accessPayload: AccessTokenPayload = {
        sub: params.userId,
        sid: params.sessionId,
        email: params.email,
        role: params.role,
        type: 'access',
      };
  
      const refreshPayload: RefreshTokenPayload = {
        sub: params.userId,
        sid: params.sessionId,
        type: 'refresh',
      };
  
      const [accessToken, refreshToken] =
        await Promise.all([
          this.jwt.signAsync(accessPayload, {
            secret: accessSecret,
            expiresIn: accessTtl,
            issuer,
            audience,
          }),
  
          this.jwt.signAsync(refreshPayload, {
            secret: refreshSecret,
            expiresIn: refreshTtl,
            issuer,
            audience,
          }),
        ]);
  
      return {
        accessToken,
        refreshToken,
        tokenType: 'Bearer',
        accessTokenExpiresIn: accessTtl,
        refreshTokenExpiresIn: refreshTtl,
        refreshExpiresAt: new Date(
          Date.now() + refreshTtl * 1000,
        ),
      };
    }
  
    async verifyAccessToken(
      token: string,
    ): Promise<AccessTokenPayload> {
      try {
        const payload =
          await this.jwt.verifyAsync<AccessTokenPayload>(
            token,
            {
              secret:
                this.config.getOrThrow<string>(
                  'JWT_ACCESS_SECRET',
                ),
  
              issuer:
                this.config.getOrThrow<string>(
                  'JWT_ISSUER',
                ),
  
              audience:
                this.config.getOrThrow<string>(
                  'JWT_AUDIENCE',
                ),
            },
          );
  
        if (
          payload.type !== 'access' ||
          !payload.sub ||
          !payload.sid
        ) {
          throw new Error(
            'Invalid access token payload',
          );
        }
  
        return payload;
      } catch {
        throw new UnauthorizedException({
          code: 'UNAUTHORIZED',
          message:
            'Access token không hợp lệ hoặc đã hết hạn.',
        });
      }
    }
  
    async verifyRefreshToken(
      token: string,
    ): Promise<RefreshTokenPayload> {
      try {
        const payload =
          await this.jwt.verifyAsync<RefreshTokenPayload>(
            token,
            {
              secret:
                this.config.getOrThrow<string>(
                  'JWT_REFRESH_SECRET',
                ),
  
              issuer:
                this.config.getOrThrow<string>(
                  'JWT_ISSUER',
                ),
  
              audience:
                this.config.getOrThrow<string>(
                  'JWT_AUDIENCE',
                ),
            },
          );
  
        if (
          payload.type !== 'refresh' ||
          !payload.sub ||
          !payload.sid
        ) {
          throw new Error(
            'Invalid refresh token payload',
          );
        }
  
        return payload;
      } catch {
        throw new UnauthorizedException({
          code: 'INVALID_REFRESH_TOKEN',
          message:
            'Refresh token không hợp lệ hoặc đã hết hạn.',
        });
      }
    }
  }