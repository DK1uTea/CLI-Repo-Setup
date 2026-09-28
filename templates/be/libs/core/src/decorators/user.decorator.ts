import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUser } from '../types';

export const User = createParamDecorator(
  (data: keyof AuthUser | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<{ user?: AuthUser }>();
    const authUser = request.user;

    if (!authUser) {
      return undefined;
    }

    return data ? authUser[data] : authUser;
  },
);
