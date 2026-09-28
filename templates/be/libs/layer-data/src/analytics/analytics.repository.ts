import type { IngestionMetrics } from './analytics.types';

export const INGESTION_REPOSITORY = Symbol('INGESTION_REPOSITORY');

export interface IIngestionRepository {
  getMetrics(): Promise<IngestionMetrics>;
}

export type { IngestionMetrics };
