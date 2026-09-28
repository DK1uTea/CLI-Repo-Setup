import { HttpException } from '@nestjs/common';
import { REASON_PHRASES, STATUS_CODES } from '../constants';

export interface ApiErrorResponse<T = unknown> {
  message: string;
  errors: T[];
  timestamp: string;
}

export class BaseHttpError<T = unknown> extends HttpException {
  constructor(message: string, status: number, errors: T[] = []) {
    super(
      {
        message,
        errors,
        timestamp: new Date().toISOString(),
      },
      status,
    );
  }
}

export class Api400HttpError<T = unknown> extends BaseHttpError<T> {
  constructor(
    message = REASON_PHRASES.BAD_REQUEST,
    errors: T[] = [],
    status = STATUS_CODES.BAD_REQUEST,
  ) {
    super(message, status, errors);
  }
}

export class Api401HttpError<T = unknown> extends BaseHttpError<T> {
  constructor(
    message = REASON_PHRASES.UNAUTHORIZED,
    errors: T[] = [],
    status = STATUS_CODES.UNAUTHORIZED,
  ) {
    super(message, status, errors);
  }
}

export class Api403HttpError<T = unknown> extends BaseHttpError<T> {
  constructor(
    message = REASON_PHRASES.FORBIDDEN,
    errors: T[] = [],
    status = STATUS_CODES.FORBIDDEN,
  ) {
    super(message, status, errors);
  }
}

export class Api404HttpError<T = unknown> extends BaseHttpError<T> {
  constructor(
    message = REASON_PHRASES.NOT_FOUND,
    errors: T[] = [],
    status = STATUS_CODES.NOT_FOUND,
  ) {
    super(message, status, errors);
  }
}

export class Api409HttpError<T = unknown> extends BaseHttpError<T> {
  constructor(message = REASON_PHRASES.CONFLICT, errors: T[] = [], status = STATUS_CODES.CONFLICT) {
    super(message, status, errors);
  }
}

export class ApiTimeoutHttpError<T = unknown> extends BaseHttpError<T> {
  constructor(
    message = REASON_PHRASES.REQUEST_TIMEOUT,
    errors: T[] = [],
    status = STATUS_CODES.REQUEST_TIMEOUT,
  ) {
    super(message, status, errors);
  }
}

export class ApiInternalServerHttpError<T = unknown> extends BaseHttpError<T> {
  constructor(
    message = REASON_PHRASES.INTERNAL_SERVER_ERROR,
    errors: T[] = [],
    status = STATUS_CODES.INTERNAL_SERVER_ERROR,
  ) {
    super(message, status, errors);
  }
}
