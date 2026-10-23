import {
    ConflictException,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  
  import {
    createHash,
    randomUUID,
    timingSafeEqual,
  } from 'node:crypto';
  
  import * as argon2 from 'argon2';
  import {
    and,
    eq,
    gt,
    isNull,
    ne,
  } from 'drizzle-orm';
  
  import { DatabaseService } from '../database/database.service';
  
  import {
    authSessions,
    userSettings,
    users,
  } from '../database/schema';
  
  import { AuthTokenService } from './auth-token.service';
  import type { LoginDto } from './dto/login.dto';
  import type { RegisterDto } from './dto/register.dto';
  
  
  @Injectable()
  export class AuthService {

    constructor(
      private readonly database: DatabaseService,
      private readonly tokens: AuthTokenService,
    ) {}
    
    async changePassword(
      userId: string,
      currentSessionId: string,
      currentPassword: string,
      newPassword: string,
    ): Promise<void> {
      const [user] =
        await this.database.db
          .select({
            id: users.id,
            passwordHash:
              users.passwordHash,
          })
          .from(users)
          .where(
            eq(users.id, userId),
          )
          .limit(1);
    
      if (!user) {
        throw new UnauthorizedException({
          code: 'USER_NOT_FOUND',
          message:
            'Tài khoản không tồn tại.',
        });
      }
    
      const currentPasswordValid =
        await argon2.verify(
          user.passwordHash,
          currentPassword,
        );
    
      if (!currentPasswordValid) {
        throw new UnauthorizedException({
          code: 'INVALID_CURRENT_PASSWORD',
          message:
            'Mật khẩu hiện tại không đúng.',
        });
      }
    
      const samePassword =
        await argon2.verify(
          user.passwordHash,
          newPassword,
        );
    
      if (samePassword) {
        throw new ConflictException({
          code: 'PASSWORD_UNCHANGED',
          message:
            'Mật khẩu mới phải khác mật khẩu hiện tại.',
        });
      }
    
      const newPasswordHash =
        await argon2.hash(
          newPassword,
          {
            type: argon2.argon2id,
          },
        );
    
      await this.database.db.transaction(
        async (tx) => {
          await tx
            .update(users)
            .set({
              passwordHash:
                newPasswordHash,
    
              updatedAt:
                new Date(),
            })
            .where(
              eq(users.id, userId),
            );
    
          await tx
            .update(authSessions)
            .set({
              revokedAt:
                new Date(),
            })
            .where(
              and(
                eq(
                  authSessions.userId,
                  userId,
                ),
    
                ne(
                  authSessions.id,
                  currentSessionId,
                ),
    
                isNull(
                  authSessions.revokedAt,
                ),
              ),
            );
        },
      );
    }

    async register(
      dto: RegisterDto,
      userAgent?: string,
    ) {
      const email =
        dto.email.trim().toLowerCase();
  
      const passwordHash =
        await argon2.hash(
          dto.password,
          {
            type: argon2.argon2id,
          },
        );
      
      const userId = randomUUID();
      const sessionId = randomUUID();
  
      const tokenPair =
        await this.tokens.createTokenPair({
          userId,
          sessionId,
          email,
          role: 'USER',
        });
  
      const refreshTokenHash =
        this.hashRefreshToken(
          tokenPair.refreshToken,
        );
  
      try {
        await this.database.db.transaction(
          async (tx) => {
            await tx.insert(users).values({
              id: userId,
              email,
              passwordHash,
              name: dto.name.trim(),
              role: 'USER',
            });
  
            await tx
              .insert(userSettings)
              .values({
                userId,
              });
  
            await tx
              .insert(authSessions)
              .values({
                id: sessionId,
                userId,
                refreshTokenHash,
  
                deviceName:
                  dto.deviceName?.trim(),
  
                userAgent,
  
                expiresAt:
                  tokenPair.refreshExpiresAt,
              });
          },
        );
      } catch (error: unknown) {
        if (
          this.isUniqueViolation(error)
        ) {
          throw new ConflictException({
            code: 'EMAIL_ALREADY_REGISTERED',
            message:
              'Email này đã được sử dụng.',
          });
        }
  
        throw error;
      }
  
      return {
        user: {
          id: userId,
          email,
          name: dto.name.trim(),
          role: 'USER' as const,
        },
  
        tokens: this.publicTokens(
          tokenPair,
        ),
      };
    }
  
    async login(
      dto: LoginDto,
      userAgent?: string,
    ) {
      const email =
        dto.email.trim().toLowerCase();
  
      const [user] =
        await this.database.db
          .select({
            id: users.id,
            email: users.email,
            passwordHash:
              users.passwordHash,
            name: users.name,
            role: users.role,
          })
          .from(users)
          .where(
            eq(users.email, email),
          )
          .limit(1);
  
      if (!user) {
        throw this.invalidCredentials();
      }
  
      const passwordValid =
        await argon2.verify(
          user.passwordHash,
          dto.password,
        );
  
      if (!passwordValid) {
        throw this.invalidCredentials();
      }
  
      const sessionId = randomUUID();
  
      const tokenPair =
        await this.tokens.createTokenPair({
          userId: user.id,
          sessionId,
          email: user.email,
          role: user.role,
        });
  
      await this.database.db
        .insert(authSessions)
        .values({
          id: sessionId,
          userId: user.id,
  
          refreshTokenHash:
            this.hashRefreshToken(
              tokenPair.refreshToken,
            ),
  
          deviceName:
            dto.deviceName?.trim(),
  
          userAgent,
  
          expiresAt:
            tokenPair.refreshExpiresAt,
        });
  
      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
  
        tokens: this.publicTokens(
          tokenPair,
        ),
      };
    }
  
    async refresh(
      refreshToken: string,
    ) {
      const payload =
        await this.tokens.verifyRefreshToken(
          refreshToken,
        );
    
      const [record] =
        await this.database.db
          .select({
            sessionId:
              authSessions.id,
    
            userId:
              authSessions.userId,
    
            refreshTokenHash:
              authSessions.refreshTokenHash,
    
            expiresAt:
              authSessions.expiresAt,
    
            userEmail:
              users.email,
    
            userRole:
              users.role,
    
            userName:
              users.name,
          })
          .from(authSessions)
          .innerJoin(
            users,
            eq(
              authSessions.userId,
              users.id,
            ),
          )
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
            ),
          )
          .limit(1);
    
      if (!record) {
        throw new UnauthorizedException({
          code: 'SESSION_NOT_FOUND',
          message:
            'Phiên đăng nhập không còn hợp lệ.',
        });
      }
    
      if (
        record.expiresAt.getTime() <=
        Date.now()
      ) {
        throw new UnauthorizedException({
          code: 'SESSION_EXPIRED',
          message:
            'Phiên đăng nhập đã hết hạn.',
        });
      }
    
      const incomingHash =
        this.hashRefreshToken(
          refreshToken,
        );
    
      if (
        !this.safeHashEqual(
          incomingHash,
          record.refreshTokenHash,
        )
      ) {
        throw new UnauthorizedException({
          code: 'REFRESH_TOKEN_REUSED',
          message:
            'Refresh token đã được sử dụng hoặc không còn hợp lệ.',
        });
      }
    
      const tokenPair =
        await this.tokens.createTokenPair({
          userId: record.userId,
          sessionId:
            record.sessionId,
          email: record.userEmail,
          role: record.userRole,
        });
    
      const nextRefreshTokenHash =
        this.hashRefreshToken(
          tokenPair.refreshToken,
        );
    
      const [updatedSession] =
        await this.database.db
          .update(authSessions)
          .set({
            refreshTokenHash:
              nextRefreshTokenHash,
    
            lastUsedAt:
              new Date(),
    
            expiresAt:
              tokenPair.refreshExpiresAt,
          })
          .where(
            and(
              eq(
                authSessions.id,
                record.sessionId,
              ),
    
              eq(
                authSessions.userId,
                record.userId,
              ),
    
              eq(
                authSessions.refreshTokenHash,
                incomingHash,
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
          .returning({
            id: authSessions.id,
          });
    
      if (!updatedSession) {
        throw new UnauthorizedException({
          code: 'REFRESH_TOKEN_REUSED',
          message:
            'Refresh token đã được sử dụng hoặc không còn hợp lệ.',
        });
      }
    
      return {
        user: {
          id: record.userId,
          email: record.userEmail,
          name: record.userName,
          role: record.userRole,
        },
    
        tokens: this.publicTokens(
          tokenPair,
        ),
      };
    }
  
    async getCurrentUser(
      userId: string,
    ) {
      const [user] =
        await this.database.db
          .select({
            id: users.id,
            email: users.email,
            name: users.name,
            role: users.role,
          })
          .from(users)
          .where(
            eq(users.id, userId),
          )
          .limit(1);
  
      if (!user) {
        throw new UnauthorizedException({
          code: 'USER_NOT_FOUND',
          message:
            'Tài khoản không tồn tại.',
        });
      }
  
      return user;
    }
  
    private hashRefreshToken(
      token: string,
    ): string {
      return createHash('sha256')
        .update(token)
        .digest('hex');
    }
  
    private safeHashEqual(
      first: string,
      second: string,
    ): boolean {
      if (
        first.length !== second.length
      ) {
        return false;
      }
  
      return timingSafeEqual(
        Buffer.from(first, 'hex'),
        Buffer.from(second, 'hex'),
      );
    }
  
    private invalidCredentials():
      UnauthorizedException {
      return new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message:
          'Email hoặc mật khẩu không đúng.',
      });
    }
  
    private isUniqueViolation(
      error: unknown,
    ): boolean {
      if (
        typeof error !== 'object' ||
        error === null ||
        !('code' in error)
      ) {
        return false;
      }
  
      return (
        (
          error as {
            code?: unknown;
          }
        ).code === '23505'
      );
    }
  
    private publicTokens(
      tokenPair: {
        accessToken: string;
        refreshToken: string;
        tokenType: 'Bearer';
        accessTokenExpiresIn: number;
        refreshTokenExpiresIn: number;
      },
    ) {
      return {
        accessToken:
          tokenPair.accessToken,
  
        refreshToken:
          tokenPair.refreshToken,
  
        tokenType:
          tokenPair.tokenType,
  
        accessTokenExpiresIn:
          tokenPair.accessTokenExpiresIn,
  
        refreshTokenExpiresIn:
          tokenPair.refreshTokenExpiresIn,
      };
    }
    async getSessions(
        userId: string,
        currentSessionId: string,
      ) {
        const sessions =
          await this.database.db
            .select({
              id: authSessions.id,
              deviceName:
                authSessions.deviceName,
      
              userAgent:
                authSessions.userAgent,
      
              createdAt:
                authSessions.createdAt,
      
              lastUsedAt:
                authSessions.lastUsedAt,
      
              expiresAt:
                authSessions.expiresAt,
            })
            .from(authSessions)
            .where(
              and(
                eq(
                  authSessions.userId,
                  userId,
                ),
      
                isNull(
                  authSessions.revokedAt,
                ),
      
                gt(
                  authSessions.expiresAt,
                  new Date(),
                ),
              ),
            );
      
        return sessions.map(
          (session) => ({
            ...session,
      
            current:
              session.id ===
              currentSessionId,
          }),
        );
      }
      
      async logout(
        userId: string,
        sessionId: string,
      ): Promise<void> {
        await this.database.db
          .update(authSessions)
          .set({
            revokedAt: new Date(),
          })
          .where(
            and(
              eq(
                authSessions.id,
                sessionId,
              ),
      
              eq(
                authSessions.userId,
                userId,
              ),
      
              isNull(
                authSessions.revokedAt,
              ),
            ),
          );
      }
      
      async logoutAll(
        userId: string,
      ): Promise<void> {
        await this.database.db
          .update(authSessions)
          .set({
            revokedAt: new Date(),
          })
          .where(
            and(
              eq(
                authSessions.userId,
                userId,
              ),
      
              isNull(
                authSessions.revokedAt,
              ),
            ),
          );
      }
  }