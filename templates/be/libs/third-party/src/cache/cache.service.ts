import { redisConfiguration } from '@app/core';
import { Inject, Injectable, Logger } from '@nestjs/common';
import type Redis from 'ioredis';
import { DEFAULT_TTL_SECONDS, REDIS_CLIENT } from './cache.constants';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly keyPrefix: string;

  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    @Inject(redisConfiguration.KEY)
    redisConfig: ReturnType<typeof redisConfiguration>,
  ) {
    this.keyPrefix = redisConfig.keyPrefix ? `${redisConfig.keyPrefix}:` : '';
  }

  private buildKey(key: string): string {
    return `${this.keyPrefix}${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(this.buildKey(key));
    if (value === null) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }

  async set(key: string, value: unknown, ttlSeconds = DEFAULT_TTL_SECONDS): Promise<void> {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    await this.redis.set(this.buildKey(key), serialized, 'EX', ttlSeconds);
  }

  del(...keys: string[]): Promise<number> {
    return this.redis.del(...keys.map((k) => this.buildKey(k)));
  }

  async exists(key: string): Promise<boolean> {
    const count = await this.redis.exists(this.buildKey(key));
    return count > 0;
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    await this.redis.expire(this.buildKey(key), ttlSeconds);
  }

  ttl(key: string): Promise<number> {
    return this.redis.ttl(this.buildKey(key));
  }

  async keys(pattern: string): Promise<string[]> {
    const raw = await this.redis.keys(this.buildKey(pattern));
    // Strip prefix from returned keys so callers get clean keys back
    return this.keyPrefix ? raw.map((k) => k.slice(this.keyPrefix.length)) : raw;
  }

  async getOrSet<T>(
    key: string,
    fn: () => Promise<T>,
    ttlSeconds = DEFAULT_TTL_SECONDS,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    const value = await fn();
    await this.set(key, value, ttlSeconds);
    return value;
  }

  async flushByPattern(pattern: string): Promise<void> {
    const raw = await this.redis.keys(this.buildKey(pattern));
    if (raw.length === 0) return;
    await this.redis.del(...raw);
    this.logger.debug(`Flushed ${raw.length} keys matching "${pattern}"`);
  }

  sAdd(key: string, ...members: string[]): Promise<number> {
    return this.redis.sadd(this.buildKey(key), ...members);
  }

  async sIsMember(key: string, member: string): Promise<boolean> {
    const result = await this.redis.sismember(this.buildKey(key), member);
    return result === 1;
  }

  async sReplaceAll(key: string, members: string[]): Promise<void> {
    const builtKey = this.buildKey(key);
    const pipeline = this.redis.pipeline();
    pipeline.del(builtKey);
    if (members.length > 0) {
      pipeline.sadd(builtKey, ...members);
    }
    await pipeline.exec();
  }
}
