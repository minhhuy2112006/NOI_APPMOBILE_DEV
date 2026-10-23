import Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid(
      'development',
      'test',
      'production',
    )
    .default('development'),

  PORT: Joi.number()
    .port()
    .default(3000),

  DATABASE_URL: Joi.string()
    .uri({
      scheme: [
        'postgres',
        'postgresql',
      ],
    })
    .required(),

  DATABASE_POOL_MAX: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .default(10),

  DATABASE_CONNECTION_TIMEOUT_MS:
    Joi.number()
      .integer()
      .min(500)
      .default(5000),

  DATABASE_IDLE_TIMEOUT_MS:
    Joi.number()
      .integer()
      .min(1000)
      .default(30000),

  LOG_LEVEL: Joi.string()
    .valid(
      'fatal',
      'error',
      'warn',
      'info',
      'debug',
      'trace',
    )
    .default('info'),
    JWT_ACCESS_SECRET: Joi.string()
  .min(32)
  .required(),

  JWT_REFRESH_SECRET: Joi.string()
    .min(32)
    .required(),

  JWT_ACCESS_TTL_SECONDS: Joi.number()
    .integer()
    .min(60)
    .default(900),

  JWT_REFRESH_TTL_SECONDS: Joi.number()
    .integer()
    .min(3600)
    .default(2592000),

  JWT_ISSUER: Joi.string()
    .default('noi-backend'),

  JWT_AUDIENCE: Joi.string()
    .default('noi-mobile'),
});