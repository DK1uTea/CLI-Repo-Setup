import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';

import { COMMON_ERROR_CODES } from '../constants';
import { ROLES_KEY } from '../decorators';
import { Api403HttpError } from '../responses';
import { AuthUser } from '../types';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!roles) return true;

    const request = context.switchToHttp().getRequest<{ user: AuthUser }>();
    const role = request.user.role;

    if (roles.includes(role) || role === UserRole.SUPER_ADMIN) {
      return true;
    }

    throw new Api403HttpError(COMMON_ERROR_CODES.FORBIDDEN);
  }
}
