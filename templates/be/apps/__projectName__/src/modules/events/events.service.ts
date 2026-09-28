import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, PagingDto, resolveTenantReadScope } from '@app/core';
import { EVENTS_REPOSITORY, type IEventsRepository } from '@app/layer-data';
import { Inject, Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { ListEventsResponseDto } from './responses';

@Injectable()
export class EventsService {
  constructor(
    @Inject(EVENTS_REPOSITORY)
    private readonly eventsRepository: IEventsRepository,
  ) {}

  async list(tenantId: string, role: UserRole, query: PagingDto): Promise<ListEventsResponseDto> {
    const result = await this.eventsRepository.list({
      tenantId: resolveTenantReadScope({ tenantId, role }),
      page: query.page ?? DEFAULT_PAGE,
      pageSize: query.pageSize ?? DEFAULT_PAGE_SIZE,
      keyword: query.keyword,
    });

    return result;
  }

  async listByDevice(
    tenantId: string,
    role: UserRole,
    deviceId: string,
    query: PagingDto,
  ): Promise<ListEventsResponseDto> {
    const result = await this.eventsRepository.listByDevice({
      tenantId: resolveTenantReadScope({ tenantId, role }),
      deviceId,
      page: query.page ?? DEFAULT_PAGE,
      pageSize: query.pageSize ?? DEFAULT_PAGE_SIZE,
      keyword: query.keyword,
    });

    return result;
  }
}
