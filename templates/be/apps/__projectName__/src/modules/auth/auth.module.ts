import { appConfiguration } from '@app/core';
import { UsersDataModule } from '@app/layer-data';
import { Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MicrosoftTokenService } from './microsoft-token.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    UsersDataModule,
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    JwtModule.registerAsync({
      useFactory: (appConfig: ConfigType<typeof appConfiguration>) => ({
        secret: appConfig.jwtSecret,
        signOptions: {
          expiresIn: appConfig.jwtExpiresIn as any,
        },
      }),
      inject: [appConfiguration.KEY],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, MicrosoftTokenService],
})
export class AuthModule {}
