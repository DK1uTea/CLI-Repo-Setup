import { ApiSuccessResponse, PagingDto, Serialize, User } from '@app/core';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { GetDeviceEventsParamDto } from './dto';
import { EventsService } from './events.service';
import { ListEventsResponseDto } from './responses';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @Serialize(ListEventsResponseDto)
  @ApiOperation({ summary: 'Get list of events with filtering and pagination' })
  @ApiSuccessResponse(ListEventsResponseDto, 'Get events successful')
  list(
    @User('tenantId') tenantId: string,
    @User('role') role: UserRole,
    @Query() query: PagingDto,
  ): Promise<ListEventsResponseDto> {
    return this.eventsService.list(tenantId, role, query);
  }

  @Get('/:deviceId')
  @Serialize(ListEventsResponseDto)
  @ApiOperation({ summary: 'Get events for a specific device' })
  @ApiSuccessResponse(ListEventsResponseDto, 'Get device events successful')
  listByDevice(
    @User('tenantId') tenantId: string,
    @User('role') role: UserRole,
    @Param() params: GetDeviceEventsParamDto,
    @Query() query: PagingDto,
  ): Promise<ListEventsResponseDto> {
    return this.eventsService.listByDevice(tenantId, role, params.deviceId, query);
  }
}
