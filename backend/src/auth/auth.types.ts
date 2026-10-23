import type { FastifyRequest } from 'fastify';

import { userRoleEnum } from '../database/schema/users';

export type UserRole =
  (typeof userRoleEnum.enumValues)[number];

export type AccessTokenPayload = {
  sub: string;
  sid: string;
  email: string;
  role: UserRole;
  type: 'access';
};

export type RefreshTokenPayload = {
  sub: string;
  sid: string;
  type: 'refresh';
};

export interface AuthenticatedRequest
  extends FastifyRequest {
  auth: AccessTokenPayload;
}

export type TokenPair = {
  accessToken: string;
  refreshToken: string;

  tokenType: 'Bearer';

  accessTokenExpiresIn: number;
  refreshTokenExpiresIn: number;

  refreshExpiresAt: Date;
};