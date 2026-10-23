import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  
  import {
    and,
    eq,
    gt,
    isNull,
  } from 'drizzle-orm';
  
  import { DatabaseService } from '../../database/database.service';
  
  import {
    authSessions,
  } from '../../database/schema';
  
  import { AuthTokenService } from '../auth-token.service';
  
  import type {
    AuthenticatedRequest,
  } from '../auth.types';
  
  @Injectable()
  export class AccessTokenGuard
    implements CanActivate
  {
    constructor(
      private readonly tokens:
        AuthTokenService,
  
      private readonly database:
        DatabaseService,
    ) {}
  
    async canActivate(
      context: ExecutionContext,
    ): Promise<boolean> {
      const request =
        context
          .switchToHttp()
          .getRequest<AuthenticatedRequest>();
  
      const authorization =
        request.headers.authorization;
  
      if (!authorization) {
        throw this.unauthorized();
      }
  
      const [scheme, token] =
        authorization.split(' ');
  
      if (
        scheme !== 'Bearer' ||
        !token
      ) {
        throw this.unauthorized();
      }
  
      const payload =
        await this.tokens
          .verifyAccessToken(token);
  
      const [session] =
        await this.database.db
          .select({
            id: authSessions.id,
          })
          .from(authSessions)
          .where(
            and(
              eq(
                authSessions.id,
                payload.sid,
              ),
  
              eq(
                authSessions.userId,
                payload.sub,
              ),
  
              isNull(
                authSessions.revokedAt,
              ),
  
              gt(
                authSessions.expiresAt,
                new Date(),
              ),
            ),
          )
          .limit(1);
  
      if (!session) {
        throw new UnauthorizedException({
          code: 'SESSION_INVALID',
          message:
            'Phiên đăng nhập không còn hợp lệ.',
        });
      }
  
      request.auth = payload;
  
      return true;
    }
  
    private unauthorized():
      UnauthorizedException {
      return new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message:
          'Access Token không hợp lệ.',
      });
    }
  }