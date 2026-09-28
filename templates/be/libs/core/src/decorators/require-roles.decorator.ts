import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'require_roles';
export const RequireRoles = (...roles: string[]): MethodDecorator & ClassDecorator =>
  SetMetadata(ROLES_KEY, roles);
