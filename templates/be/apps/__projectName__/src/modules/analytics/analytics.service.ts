import { type IIngestionRepository, INGESTION_REPOSITORY } from '@app/layer-data';
import { CACHE_KEYS, CacheService } from '@app/third-party';
import { Inject, Injectable } from '@nestjs/common';
import { IngestionMetricsResponseDto } from './responses';

// Metrics aggregate 4 cross-table queries — cache 30s to reduce DB load
// while keeping positionsLast1Min window meaningful (max staleness = 30s)
const INGESTION_METRICS_TTL = 30;

@Injectable()
export class AnalyticsService {
  constructor(
    @Inject(INGESTION_REPOSITORY)
    private readonly ingestionRepository: IIngestionRepository,
    private readonly cacheService: CacheService,
  ) {}

  getIngestionMetrics(): Promise<IngestionMetricsResponseDto> {
    return this.cacheService.getOrSet(
      CACHE_KEYS.analytics.ingestion,
      () => this.ingestionRepository.getMetrics(),
      INGESTION_METRICS_TTL,
    );
  }
}
