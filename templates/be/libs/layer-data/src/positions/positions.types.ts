import type { PaginatedResult } from '@app/core';

// ── Device Status (latest state) ────────────────────────────────────────────

export interface LatestPositionEntity {
  device: {
    id: string;
    internalId: string;
    name: string;
    imei: string;
  };
  state: {
    battery: number | null;
    batteryVoltage: number | null;
    gsmSignal: number | null;
    lastSeenAt: Date | null;
    isOnline: boolean;
  };
  position: {
    deviceTime: Date | null;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    speedKph: number | null;
    heading: number | null;
    gpsValid: boolean | null;
  };
}

export interface ListLatestPositionsQuery {
  /** undefined = all tenants (SUPER_ADMIN only). */
  tenantId?: string | string[];
  page: number;
  pageSize: number;
}

export type ListLatestPositionsResult = PaginatedResult<LatestPositionEntity>;

// ── Live Map Positions (lightweight for real-time visualization) ─────────────

export interface GetLiveMapPositionsQuery {
  /** undefined = all tenants (SUPER_ADMIN only). */
  tenantId?: string | string[];
  deviceIds?: string[];
}

export interface GetDeviceLatestPositionQuery {
  /** undefined = any tenant (SUPER_ADMIN only). */
  tenantId?: string | string[];
  deviceId: string;
}

// ── Device Status Entity ────────────────────────────────────────────────────────────

export interface DeviceStatusEntity {
  id: string;
  deviceId: string;
  tenantId: string;
  battery: number | null;
  batteryVoltage: number | null;
  gsmSignal: number | null;
  lastSeenAt: Date | null;
  lastAddress: string | null;
  lastLatitude: number | null;
  lastLongitude: number | null;
  lastSpeedKph: number | null;
  lastHeading: number | null;
  lastGpsValid: boolean | null;
  lastDeviceTime: Date | null;
}

// ── Device Status Summary (dùng cho device list enrichment) ─────────────────

export interface DeviceStatusSummary {
  deviceId: string;
  isOnline: boolean;
  battery: number | null;
  gsmSignal: number | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
}

// ── Device Status Write ─────────────────────────────────────────────────────────

export interface UpsertDeviceStatusInput {
  battery?: number | null;
  batteryVoltage?: number | null;
  gsmSignal?: number | null;
  lastSeenAt?: Date;
  lastAddress?: string | null;
  lastLatitude?: number | null;
  lastLongitude?: number | null;
  lastSpeedKph?: number | null;
  lastHeading?: number | null;
  lastGpsValid?: boolean | null;
  lastDeviceTime?: Date | null;
}

// ── Position Write ───────────────────────────────────────────────────────────

export interface CreatePositionInput {
  deviceId: string;
  tenantId: string;
  deviceTime: Date;
  address?: string | null;
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  speedKph?: number;
  heading?: number;
  satellites?: number;
  gpsValid: boolean;
  rawPayload?: Record<string, unknown>;
}

// ── Positions (history) ──────────────────────────────────────────────────────

export interface PositionStateSnapshot {
  battery: number | null;
  batteryVoltage: number | null;
  gsmSignal: number | null;
}

export interface PositionHistoryEntity {
  deviceTime: Date;
  address: string | null;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  altitude: number | null;
  speedKph: number | null;
  heading: number | null;
  satellites: number | null;
  gpsValid: boolean;
  state: PositionStateSnapshot | null;
}

/**
 * Opaque cursor token payload — scope bởi tenantId + deviceId + from + to.
 * Không expose ra API, chỉ dùng nội bộ để decode/encode cursor.
 */
export interface PositionHistoryCursorPayload {
  deviceTime: string; // ISO8601
  id: string;
}

/**
 * Kết quả history với cursor-based pagination.
 */
export interface PositionHistoryPageResult {
  items: PositionHistoryEntity[];
  nextCursor?: string | null;
  hasMore: boolean;
}

export interface ListPositionHistoryQuery {
  deviceId: string;
  /** undefined = any tenant (SUPER_ADMIN only); string[] = operator visibility set. */
  tenantId?: string | string[];
  from: Date;
  to: Date;
  limit?: number;
  cursor?: string;
}
