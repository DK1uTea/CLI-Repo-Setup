import { Module } from '@nestjs/common';
import { PrismaUsersRepository } from './prisma-users.repository';
import { USERS_REPOSITORY } from './users.repository';

/**
 * UsersDataModule — cung cấp data access cho domain Users.
 *
 * Import module này vào feature module cần đọc/ghi user data.
 * Chỉ export DI token — consumer không biết về class cụ thể.
 *
 * PrismaService được inject tự động qua PrismaModule (global).
 */
@Module({
  providers: [
    PrismaUsersRepository,
    {
      provide: USERS_REPOSITORY,
      useExisting: PrismaUsersRepository,
    },
  ],
  exports: [USERS_REPOSITORY],
})
export class UsersDataModule {}
