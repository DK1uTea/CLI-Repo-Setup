import type {
  CreatePositionInput,
  DeviceStatusEntity,
  DeviceStatusSummary,
  GetDeviceLatestPositionQuery,
  GetLiveMapPositionsQuery,
  LatestPositionEntity,
  ListLatestPositionsQuery,
  ListLatestPositionsResult,
  ListPositionHistoryQuery,
  PositionHistoryCursorPayload,
  PositionHistoryEntity,
  PositionHistoryPageResult,
  UpsertDeviceStatusInput,
} from './positions.types';

export const POSITIONS_REPOSITORY = Symbol('POSITIONS_REPOSITORY');
export const DEVICE_STATUS_REPOSITORY = Symbol('DEVICE_STATUS_REPOSITORY');

export interface IPositionsRepository {
  /**
   * Fetch position history with cursor-based pagination and daily cap.
   * Each day is limited to 5 newest records before pagination.
   * Returns nextCursor and hasMore for load-more pattern.
   */
  findHistory(query: ListPositionHistoryQuery): Promise<PositionHistoryPageResult>;

  /** Insert một position — dùng cho TCP ingestion (per-job). skipDuplicates để idempotent khi BullMQ retry. */
  createOne(input: CreatePositionInput): Promise<void>;
}

export interface IDeviceStatusRepository {
  findLatestPerDevice(query: ListLatestPositionsQuery): Promise<ListLatestPositionsResult>;
  findLiveMapPositions(query: GetLiveMapPositionsQuery): Promise<LatestPositionEntity[]>;
  findDeviceLatestPosition(
    query: GetDeviceLatestPositionQuery,
  ): Promise<LatestPositionEntity | null>;
  /** Bulk-fetch status summary cho nhiều device — dùng cho device list enrichment. */
  findStatusByDeviceIds(
    deviceIds: string[],
    tenantId?: string | string[],
  ): Promise<Map<string, DeviceStatusSummary>>;
  /** Upsert device status by deviceId — update nếu có, create nếu không. lastGeom tự động populate từ trigger. */
  upsertByDeviceId(
    where: { deviceId: string },
    data: UpsertDeviceStatusInput,
    updateContext: { tenantId: string },
  ): Promise<DeviceStatusEntity>;
}

export type {
  CreatePositionInput,
  DeviceStatusEntity,
  DeviceStatusSummary,
  GetDeviceLatestPositionQuery,
  GetLiveMapPositionsQuery,
  LatestPositionEntity,
  ListLatestPositionsQuery,
  ListLatestPositionsResult,
  ListPositionHistoryQuery,
  PositionHistoryCursorPayload,
  PositionHistoryEntity,
  PositionHistoryPageResult,
  UpsertDeviceStatusInput,
};
