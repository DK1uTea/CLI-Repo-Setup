import { registerAs } from '@nestjs/config';
import Joi from 'joi';

export const redisSchema = {
  REDIS_URL: Joi.string()
    .uri({ scheme: ['redis', 'rediss'] })
    .optional(),
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().optional().allow(''),
  REDIS_DB: Joi.number().default(0),
  REDIS_TLS: Joi.boolean().default(false),
  REDIS_KEY_PREFIX: Joi.string().optional().allow('').default(''),
};

export interface IRedisConfig {
  url?: string;
  host: string;
  port: number;
  password: string;
  db: number;
  tls: boolean;
  keyPrefix: string;
}

export const getRedisConfig = (): IRedisConfig => {
  const url = process.env.REDIS_URL;
  const db = Number(process.env.REDIS_DB ?? 0);
  const keyPrefix = process.env.REDIS_KEY_PREFIX ?? '';

  if (url) {
    const parsed = new URL(url);
    return {
      url,
      host: parsed.hostname,
      port: Number(parsed.port || 6379),
      password: decodeURIComponent(parsed.password || ''),
      db,
      tls: parsed.protocol === 'rediss:' || process.env.REDIS_TLS === 'true',
      keyPrefix,
    };
  }

  return {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: Number(process.env.REDIS_PORT ?? 6379),
    password: process.env.REDIS_PASSWORD ?? '',
    db,
    tls: process.env.REDIS_TLS === 'true',
    keyPrefix,
  };
};

export const redisConfiguration = registerAs('redis', getRedisConfig);
