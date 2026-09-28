import { CallHandler, ExecutionContext, Injectable, NestInterceptor, Type } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { plainToInstance } from 'class-transformer';
import { map, Observable } from 'rxjs';
import { SERIALIZE_DTO_KEY } from '../decorators';

@Injectable()
export class SerializerInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const model = this.reflector.getAllAndOverride<Type<unknown>>(SERIALIZE_DTO_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!model) {
      return next.handle();
    }

    return next.handle().pipe(
      map((payload: unknown) => {
        if (payload === null || payload === undefined) {
          return payload;
        }

        if (typeof payload !== 'object') {
          return payload;
        }

        return plainToInstance(model, payload, {
          excludeExtraneousValues: true,
        });
      }),
    );
  }
}
