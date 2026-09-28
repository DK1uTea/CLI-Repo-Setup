import {
  appConfiguration,
  appSchema,
  HttpExceptionFilter,
  ResponseInterceptor,
  RolesGuard,
  redisConfiguration,
  redisSchema,
  SerializerInterceptor,
} from '@app/core';
import { CacheModule, PrismaModule } from '@app/third-party';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import Joi from 'joi';
import { AuthModule, TenantsModule, UsersModule } from './modules';
import { JwtAuthGuard } from './modules/auth/guards';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        ...appSchema,
        ...redisSchema,
      }),
      load: [appConfiguration, redisConfiguration],
    }),
    PrismaModule,
    CacheModule,
    AuthModule,
    TenantsModule,
    UsersModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: SerializerInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
