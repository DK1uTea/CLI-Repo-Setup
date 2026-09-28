import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { COMMON_ERROR_CODES } from '../constants';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    if (host.getType() !== 'http') {
      throw exception;
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const { message, data } = this.buildErrorPayload(exception);

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url} -> ${status} ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.json({
      error_code: message, // TODO: seperate error code and message
      status,
      data,
    });
  }

  private buildErrorPayload(exception: unknown): {
    message: string;
    data: Record<string, any>;
  } {
    if (exception instanceof HttpException) {
      const errorResponse = exception.getResponse();

      if (typeof errorResponse === 'string') {
        return {
          message: errorResponse,
          data: {},
        };
      }

      if (errorResponse && typeof errorResponse === 'object') {
        const payload = errorResponse as Record<string, unknown>;
        const rawMessage = payload.message;

        if (Array.isArray(rawMessage)) {
          return {
            message: 'Validation failed',
            data: { errors: rawMessage },
          };
        }

        if (typeof rawMessage === 'string') {
          return {
            message: rawMessage,
            data: {},
          };
        }
      }

      return {
        message: exception.message,
        data: {},
      };
    }

    return {
      message: COMMON_ERROR_CODES.INTERNAL_SERVER_ERROR,
      data: {},
    };
  }
}
