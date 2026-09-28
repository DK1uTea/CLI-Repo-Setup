import { redisConfiguration } from '@app/core';
import { Global, Logger, Module } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './cache.constants';
import { CacheService } from './cache.service';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [redisConfiguration.KEY],
      useFactory: (redisConfig: ReturnType<typeof redisConfiguration>): Redis => {
        const logger = new Logger('RedisClient');

        const client = new Redis({
          ...(redisConfig.url ? { lazyConnect: false } : {}),
          host: redisConfig.host,
          port: redisConfig.port,
          password: redisConfig.password || undefined,
          db: redisConfig.db,
          tls: redisConfig.tls ? {} : undefined,
          maxRetriesPerRequest: 3,
          retryStrategy: (times) => {
            if (times > 5) {
              logger.error('Redis: max retries reached, giving up');
              return null;
            }
            const delay = Math.min(times * 200, 2000);
            logger.warn(`Redis: retry #${times} in ${delay}ms`);
            return delay;
          },
        });

        client.on('connect', () => logger.log('Redis connected'));
        client.on('error', (err: Error) => logger.error(`Redis error: ${err.message}`));
        client.on('close', () => logger.warn('Redis connection closed'));

        return client;
      },
    },
    CacheService,
  ],
  exports: [CacheService],
})
export class CacheModule {}
