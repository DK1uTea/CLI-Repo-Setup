import { Module } from '@nestjs/common';
import { PrismaTenantsRepository } from './prisma-tenants.repository';
import { TENANTS_REPOSITORY } from './tenants.repository';

@Module({
  providers: [
    PrismaTenantsRepository,
    {
      provide: TENANTS_REPOSITORY,
      useExisting: PrismaTenantsRepository,
    },
  ],
  exports: [TENANTS_REPOSITORY],
})
export class TenantsDataModule {}
