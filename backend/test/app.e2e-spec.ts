import {
  ValidationPipe,
} from '@nestjs/common';

import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
} from '@jest/globals';

import {
  FastifyAdapter,
  type NestFastifyApplication,
} from '@nestjs/platform-fastify';

import {
  Test,
} from '@nestjs/testing';

import {
  AppModule,
} from '../src/app.module';

describe(
  'NOI backend (e2e)',
  () => {
    let app:
      NestFastifyApplication;

    beforeAll(
      async () => {
        const moduleRef =
          await Test
            .createTestingModule({
              imports: [
                AppModule,
              ],
            })
            .compile();

        app =
          moduleRef
            .createNestApplication<
              NestFastifyApplication
            >(
              new FastifyAdapter({
                bodyLimit: 1_048_576,
              }),
            );

        app.useGlobalPipes(
          new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted:
              true,
            transform: true,
            transformOptions: {
              enableImplicitConversion:
                false,
            },
          }),
        );

        await app.init();

        await app
          .getHttpAdapter()
          .getInstance()
          .ready();
      },
    );

    afterAll(
      async () => {
        await app.close();
      },
    );

    it(
      'GET /health',
      async () => {
        const response =
          await app.inject({
            method: 'GET',
            url: '/health',
          });

        expect(
          response.statusCode,
        ).toBe(200);

        const body =
          response.json<{
            status: string;
            database: string;
          }>();

        expect(
          body.status,
        ).toBe('ok');

        expect(
          body.database,
        ).toBe('up');
      },
    );
  },
);