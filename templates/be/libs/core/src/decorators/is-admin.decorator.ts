import { SetMetadata } from '@nestjs/common';

export const IS_ADMIN_KEY = 'isAdmin';

export const IsAdmin = (): MethodDecorator & ClassDecorator => SetMetadata(IS_ADMIN_KEY, true);
