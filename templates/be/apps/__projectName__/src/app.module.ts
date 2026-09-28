import {
  appConfiguration,
  appSchema,
  awsConfiguration,
  awsSchema,
  entraConfiguration,
  entraSchema,
  HttpExceptionFilter,
  ResponseInterceptor,
  RolesGuard,
  redisConfiguration,
  redisSchema,
  SerializerInterceptor,
} from '@app/core';
import { AwsModule, CacheModule, PrismaModule } from '@app/third-party';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import Joi from 'joi';
import {
  AnalyticsModule,
  AuthModule,
  DevicesModule,
  EventsModule,
  PositionsModule,
  SettingsModule,
  TenantsModule,
  UploadModule,
  UsersModule,
} from './modules';
import { JwtAuthGuard } from './modules/auth/guards';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        ...appSchema,
        ...redisSchema,
        ...awsSchema,
        ...entraSchema,
      }),
      load: [appConfiguration, redisConfiguration, awsConfiguration, entraConfiguration],
    }),
    PrismaModule,
    CacheModule,
    AwsModule,
    AnalyticsModule,
    AuthModule,
    DevicesModule,
    EventsModule,
    PositionsModule,
    SettingsModule,
    TenantsModule,
    UploadModule,
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
