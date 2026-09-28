import { BaseRepository, PrismaService } from '@app/third-party';
import { Injectable } from '@nestjs/common';
import type { ITenantsRepository } from './tenants.repository';
import type { TenantItemEntity } from './tenants.types';

@Injectable()
export class PrismaTenantsRepository
  extends BaseRepository<PrismaService['tenant']>
  implements ITenantsRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  protected get model(): PrismaService['tenant'] {
    return this.prisma.tenant;
  }

  async list(): Promise<TenantItemEntity[]> {
    const items = await this.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return items;
  }
}
