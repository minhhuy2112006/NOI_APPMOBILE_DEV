import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const fastifyAdapter = new FastifyAdapter({
    bodyLimit: 1_048_576,
  });

  const app = await NestFactory.create(
    AppModule,
    fastifyAdapter,
    {
      bufferLogs: true,
    },
  );

  app.useLogger(app.get(Logger));

  app.enableShutdownHooks();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: false,
      },
    }),
  );

  const port = Number(process.env.PORT ?? 3000);

  await app.listen(port, '0.0.0.0');
}

void bootstrap();