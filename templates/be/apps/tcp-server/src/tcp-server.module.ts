import { redisConfiguration, redisSchema, tcpConfiguration, tcpSchema } from '@app/core';
import { PrismaModule } from '@app/third-party';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';
import { TcpIngestionModule } from './ingestion/tcp-ingestion.module';
import { SessionModule } from './session/session.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        ...tcpSchema,
        ...redisSchema,
      }),
      load: [tcpConfiguration, redisConfiguration],
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
    SessionModule,
    TcpIngestionModule,
  ],
})
export class TcpServerModule {}
