import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';

import { AuthModule } from './auth/auth.module';
import { envValidationSchema } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { UsersModule } from './users/users.module';
import {
  OrganizationsModule,
} from './organizations/organizations.module';
import {
  CampaignsModule,
} from './campaigns/campaigns.module';
import {
  ApplicationsModule,
} from './applications/applications.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validationSchema: envValidationSchema,
      validationOptions: {
        libraryOptions: {
          abortEarly: false,
          allowUnknown: true,
        },
      },
    }),

    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? 'info',
        redact: [
          'req.headers.authorization',
          'req.headers.cookie',
        ],
      },
    }),

    DatabaseModule,
    HealthModule,
    AuthModule,
    DatabaseModule,
    HealthModule,
    AuthModule,
    UsersModule,
    OrganizationsModule,
    CampaignsModule,
    ApplicationsModule,
  ],
})
export class AppModule {}
