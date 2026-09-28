import { BaseRepository, PrismaService } from '@app/third-party';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { IEventsRepository } from './events.repository';
import type { ListEventsByDeviceQuery, ListEventsQuery, ListEventsResult } from './events.types';

@Injectable()
export class PrismaEventsRepository
  extends BaseRepository<PrismaService['event']>
  implements IEventsRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  protected get model(): PrismaService['event'] {
    return this.prisma.event;
  }

  async list(query: ListEventsQuery): Promise<ListEventsResult> {
    // undefined = SUPER_ADMIN (no filter); string = one tenant; string[] = operator visibility set.
    const where: Prisma.EventWhereInput = {};
    if (query.tenantId !== undefined)
      where.tenantId = Array.isArray(query.tenantId) ? { in: query.tenantId } : query.tenantId;

    const result = await this.findPagination<Prisma.EventFindManyArgs, Prisma.EventCountArgs>(
      {
        where,
        select: {
          id: true,
          deviceTime: true,
          type: true,
          payload: true,
          message: true,
        },
        orderBy: { deviceTime: 'desc' },
      },
      {
        page: query.page,
        pageSize: query.pageSize,
      },
    );

    return result;
  }

  async listByDevice(query: ListEventsByDeviceQuery): Promise<ListEventsResult> {
    // undefined = SUPER_ADMIN (no filter); string = one tenant; string[] = operator visibility set.
    const where: Prisma.EventWhereInput = { deviceId: query.deviceId };
    if (query.tenantId !== undefined)
      where.tenantId = Array.isArray(query.tenantId) ? { in: query.tenantId } : query.tenantId;

    const result = await this.findPagination<Prisma.EventFindManyArgs, Prisma.EventCountArgs>(
      {
        where,
        select: {
          id: true,
          deviceTime: true,
          type: true,
          payload: true,
          message: true,
        },
        orderBy: { deviceTime: 'desc' },
      },
      {
        page: query.page,
        pageSize: query.pageSize,
      },
    );

    return result;
  }
}
