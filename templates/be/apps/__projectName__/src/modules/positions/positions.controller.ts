import { ApiSuccessResponse, Serialize, User } from '@app/core';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import {
  GetDeviceLatestPositionParamDto,
  GetLiveMapPositionsDto,
  ListLatestPositionsDto,
  ListPositionHistoryDto,
} from './dto';
import { PositionsService } from './positions.service';
import {
  LatestPositionResponseDto,
  LatestPositionsResponseDto,
  LiveMapPositionsResponseDto,
  PositionHistoryResponseDto,
} from './responses';

@ApiTags('Positions')
@Controller('positions')
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @Get('latest')
  @Serialize(LatestPositionsResponseDto)
  @ApiOperation({ summary: 'Get latest position of each device' })
  @ApiSuccessResponse(LatestPositionsResponseDto, 'Get latest positions successful')
  findLatestPerDevice(
    @User('tenantId') tenantId: string,
    @User('role') role: UserRole,
    @Query() dto: ListLatestPositionsDto,
  ): Promise<LatestPositionsResponseDto> {
    return this.positionsService.findLatestPerDevice(tenantId, role, dto);
  }

  @Get('live-map')
  @Serialize(LiveMapPositionsResponseDto)
  @ApiOperation({
    summary: 'Get latest positions for live map visualization',
    description:
      'Optimized endpoint for live map rendering. Supports bulk device queries. ' +
      'Returns lightweight response with minimal latency. ' +
      'If deviceIds is not provided, returns all devices accessible to the user.',
  })
  @ApiSuccessResponse(LiveMapPositionsResponseDto, 'Get live map positions successful')
  getLiveMapPositions(
    @User('tenantId') tenantId: string,
    @User('role') role: UserRole,
    @Query() dto: GetLiveMapPositionsDto,
  ): Promise<LiveMapPositionsResponseDto> {
    return this.positionsService.getLiveMapPositions(tenantId, role, dto);
  }

  @Get('live-map/:id')
  @Serialize(LatestPositionResponseDto)
  @ApiOperation({
    summary: 'Get latest position for a single device',
    description:
      'Returns the latest position data for a specific device. ' +
      'Returns 404 if device not found or no position data available.',
  })
  @ApiSuccessResponse(LatestPositionResponseDto, 'Get device latest position successful')
  getDeviceLatestPosition(
    @User('tenantId') tenantId: string,
    @User('role') role: UserRole,
    @Param() params: GetDeviceLatestPositionParamDto,
  ): Promise<LatestPositionResponseDto> {
    return this.positionsService.getDeviceLatestPosition(tenantId, role, params.id);
  }

  @Get('history')
  @Serialize(PositionHistoryResponseDto)
  @ApiOperation({ summary: 'Get position & state history of a device' })
  @ApiSuccessResponse(PositionHistoryResponseDto, 'Get position history successful')
  findHistory(
    @User('tenantId') tenantId: string,
    @User('role') role: UserRole,
    @Query() dto: ListPositionHistoryDto,
  ): Promise<PositionHistoryResponseDto> {
    return this.positionsService.findHistory(tenantId, role, dto);
  }
}
