import {
  Api404HttpError,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  resolveTenantReadScope,
} from '@app/core';
import {
  DEVICE_STATUS_REPOSITORY,
  type IDeviceStatusRepository,
  type IPositionsRepository,
  POSITIONS_REPOSITORY,
} from '@app/layer-data';
import { Inject, Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { POSITION_ERROR_CODES } from './constants/positions.error-codes';
import { GetLiveMapPositionsDto, ListLatestPositionsDto, ListPositionHistoryDto } from './dto';
import {
  LatestPositionResponseDto,
  LatestPositionsResponseDto,
  LiveMapPositionsResponseDto,
  PositionHistoryResponseDto,
} from './responses';

@Injectable()
export class PositionsService {
  constructor(
    @Inject(DEVICE_STATUS_REPOSITORY)
    private readonly deviceStatusRepository: IDeviceStatusRepository,
    @Inject(POSITIONS_REPOSITORY)
    private readonly positionsRepository: IPositionsRepository,
  ) {}

  findLatestPerDevice(
    tenantId: string,
    role: UserRole,
    dto: ListLatestPositionsDto,
  ): Promise<LatestPositionsResponseDto> {
    return this.deviceStatusRepository.findLatestPerDevice({
      tenantId: resolveTenantReadScope({ tenantId, role }),
      page: dto.page ?? DEFAULT_PAGE,
      pageSize: dto.pageSize ?? DEFAULT_PAGE_SIZE,
    });
  }

  async findHistory(
    tenantId: string,
    role: UserRole,
    dto: ListPositionHistoryDto,
  ): Promise<PositionHistoryResponseDto> {
    const pageResult = await this.positionsRepository.findHistory({
      deviceId: dto.deviceId,
      tenantId: resolveTenantReadScope({ tenantId, role }),
      from: new Date(dto.from),
      to: new Date(dto.to),
      limit: dto.limit,
      cursor: dto.cursor,
    });

    return {
      items: pageResult.items,
      nextCursor: pageResult.nextCursor,
      hasMore: pageResult.hasMore,
    };
  }

  /**
   * Get latest positions for live map visualization.
   * Optimized for lightweight responses and low latency.
   * Supports bulk device queries in a single request.
   */
  async getLiveMapPositions(
    tenantId: string,
    role: UserRole,
    dto: GetLiveMapPositionsDto,
  ): Promise<LiveMapPositionsResponseDto> {
    const items = await this.deviceStatusRepository.findLiveMapPositions({
      tenantId: resolveTenantReadScope({ tenantId, role }),
      deviceIds: dto.deviceIds,
    });

    return {
      items,
      total: items.length,
    };
  }

  /**
   * Get latest position for a single device.
   * Returns 404 if device not found or not accessible.
   */
  async getDeviceLatestPosition(
    tenantId: string,
    role: UserRole,
    deviceId: string,
  ): Promise<LatestPositionResponseDto> {
    const position = await this.deviceStatusRepository.findDeviceLatestPosition({
      tenantId: resolveTenantReadScope({ tenantId, role }),
      deviceId,
    });

    if (!position) {
      throw new Api404HttpError(POSITION_ERROR_CODES.DEVICE_NOT_FOUND_OR_NO_DATA);
    }

    return position;
  }
}
