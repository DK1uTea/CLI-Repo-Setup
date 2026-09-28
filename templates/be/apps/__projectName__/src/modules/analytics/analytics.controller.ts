import { ApiSuccessResponse, RequireRoles, Serialize } from '@app/core';
import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { AnalyticsService } from './analytics.service';
import { IngestionMetricsResponseDto } from './responses';

@ApiTags('Analytics')
@Controller('analytics')
@RequireRoles(UserRole.SUPER_ADMIN)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('ingestion')
  @Serialize(IngestionMetricsResponseDto)
  @ApiOperation({
    summary: 'Get ingestion pipeline metrics',
    description:
      'Returns device last_seen timestamps, positions/min ingestion rate, and recent error events. SUPER_ADMIN only.',
  })
  @ApiSuccessResponse(IngestionMetricsResponseDto, 'Get ingestion metrics successful')
  getIngestionMetrics(): Promise<IngestionMetricsResponseDto> {
    return this.analyticsService.getIngestionMetrics();
  }
}
