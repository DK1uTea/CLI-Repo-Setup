import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    return next.handle().pipe(
      map((payload: unknown) => ({
        message: 'Success',
        status: 200,
        data: this.normalizeData(payload),
      })),
    );
  }

  private normalizeData(payload: unknown): Record<string, any> {
    if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
      return payload as Record<string, any>;
    }

    if (Array.isArray(payload)) {
      return { items: payload };
    }

    if (payload === null || payload === undefined) {
      return {};
    }

    return { value: payload };
  }
}
