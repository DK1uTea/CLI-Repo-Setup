import { redisConfiguration, redisSchema } from '@app/core';
import { PrismaModule } from '@app/third-party';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';
import { GPSModule } from './modules/gps/gps.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        ...redisSchema,
      }),
      load: [redisConfiguration],
    }),
    BullModule.forRootAsync({
      inject: [redisConfiguration.KEY],
      useFactory: (redisCfg: ReturnType<typeof redisConfiguration>) => ({
        connection: {
          host: redisCfg.host,
          port: redisCfg.port,
          password: redisCfg.password || undefined,
          db: redisCfg.db,
          tls: redisCfg.tls ? {} : undefined,
        },
      }),
    }),
    PrismaModule,
    GPSModule,
  ],
})
export class WorkerModule {}
