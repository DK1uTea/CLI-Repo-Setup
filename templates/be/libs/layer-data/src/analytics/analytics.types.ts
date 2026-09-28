// ── Device connectivity ───────────────────────────────────────────────────────

export interface DeviceLastSeenEntity {
  deviceId: string;
  imei: string;
  name: string;
  lastSeenAt: Date | null;
  isOnline: boolean;
}

export interface DeviceConnectivitySummary {
  totalCount: number;
  onlineCount: number;
  offlineCount: number;
  neverSeenCount: number;
  mostRecentConnection: Date | null;
}

// ── Ingestion rate ────────────────────────────────────────────────────────────

export interface IngestionRateEntity {
  positionsLast1Min: number;
  positionsLast5Min: number;
  positionsLast1Hour: number;
  positionsPerMinute: number;
}

// ── Errors ────────────────────────────────────────────────────────────────────

export interface ErrorSummaryEntity {
  type: string;
  count: number;
  latestAt: Date;
}

// ── Aggregated result ─────────────────────────────────────────────────────────

export interface IngestionMetrics {
  generatedAt: Date;
  deviceConnectivity: DeviceConnectivitySummary;
  devices: DeviceLastSeenEntity[];
  ingestionRate: IngestionRateEntity;
  recentErrors: ErrorSummaryEntity[];
}
