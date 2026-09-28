import { AuthUser, appConfiguration } from '@app/core';
import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(appConfiguration.KEY)
    appConfig: ReturnType<typeof appConfiguration>,
  ) {
    super({
      // jwtFromRequest: ExtractJwt.fromExtractors([
      //   (req) => {
      //     return req?.cookies?.accessToken;
      //   },
      // ]),

      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: appConfig.jwtSecret,
    });
  }

  validate(payload: AuthUser): AuthUser {
    return payload;
  }
}
