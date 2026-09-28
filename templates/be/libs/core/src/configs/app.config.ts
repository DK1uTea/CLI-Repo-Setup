import { registerAs } from '@nestjs/config';
import Joi from 'joi';
import { NodeEnv } from '../enums';

export const appSchema = {
  API_PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().required(),
  CORS_ORIGINS: Joi.string().default('*'),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('15m'),
  REFRESH_TOKEN_SECRET: Joi.string().required(),
  REFRESH_TOKEN_TTL_DAYS: Joi.number().default(7),
};

export interface IAppConfig {
  nodeEnv: NodeEnv;
  apiPort: number;
  databaseUrl: string;
  corsOrigins: string | string[];
  jwtSecret: string;
  jwtExpiresIn: string;
  refreshTokenSecret: string;
  refreshTokenTtlDays: number;
}

export const getAppConfig = (): IAppConfig => ({
  nodeEnv: (process.env.NODE_ENV as NodeEnv) ?? NodeEnv.Dev,
  apiPort: Number(process.env.API_PORT ?? 3000),
  databaseUrl: process.env.DATABASE_URL ?? '',
  corsOrigins: process.env.CORS_ORIGINS?.includes(',')
    ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
    : (process.env.CORS_ORIGINS ?? '*'),
  jwtSecret: process.env.JWT_SECRET ?? 'dev_jwt_secret_change_in_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET ?? 'dev_refresh_token_secret_change_in_production',
  refreshTokenTtlDays: Number(process.env.REFRESH_TOKEN_TTL_DAYS ?? 7),
});

export const appConfiguration = registerAs('app', getAppConfig);
