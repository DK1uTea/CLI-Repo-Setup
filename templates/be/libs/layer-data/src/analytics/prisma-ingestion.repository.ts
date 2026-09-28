import { PrismaService } from '@app/third-party';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { IIngestionRepository } from './analytics.repository';
import type {
  DeviceConnectivitySummary,
  DeviceLastSeenEntity,
  ErrorSummaryEntity,
  IngestionMetrics,
  IngestionRateEntity,
} from './analytics.types';

// Raw row types returned by $queryRaw
interface ConnectivitySummaryRow {
  total_count: number;
  online_count: number;
  offline_count: number;
  never_seen_count: number;
  most_recent_connection: Date | null;
}

interface DeviceLastSeenRow {
  device_id: string;
  imei: string;
  name: string;
  last_seen_at: Date | null;
  is_online: boolean;
}

interface IngestionRateRow {
  positions_last_1min: number;
  positions_last_5min: number;
  positions_last_1hour: number;
  positions_per_minute: string; // NUMERIC comes back as string in pg driver
}

interface ErrorSummaryRow {
  type: string;
  count: number;
  latest_at: Date;
}

@Injectable()
export class PrismaIngestionRepository implements IIngestionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getMetrics(): Promise<IngestionMetrics> {
    const [connectivityRows, deviceRows, rateRows, errorRows] = await Promise.all([
      this.queryConnectivitySummary(),
      this.queryDeviceLastSeen(),
      this.queryIngestionRate(),
      this.queryRecentErrors(),
    ]);

    const summary = connectivityRows[0];
    const rate = rateRows[0];

    const deviceConnectivity: DeviceConnectivitySummary = summary
      ? {
          totalCount: Number(summary.total_count),
          onlineCount: Number(summary.online_count),
          offlineCount: Number(summary.offline_count),
          neverSeenCount: Number(summary.never_seen_count),
          mostRecentConnection: summary.most_recent_connection,
        }
      : {
          totalCount: 0,
          onlineCount: 0,
          offlineCount: 0,
          neverSeenCount: 0,
          mostRecentConnection: null,
        };

    const devices: DeviceLastSeenEntity[] = deviceRows.map((row) => ({
      deviceId: row.device_id,
      imei: row.imei,
      name: row.name,
      lastSeenAt: row.last_seen_at,
      isOnline: row.is_online,
    }));

    const ingestionRate: IngestionRateEntity = rate
      ? {
          positionsLast1Min: Number(rate.positions_last_1min),
          positionsLast5Min: Number(rate.positions_last_5min),
          positionsLast1Hour: Number(rate.positions_last_1hour),
          positionsPerMinute: parseFloat(rate.positions_per_minute ?? '0'),
        }
      : {
          positionsLast1Min: 0,
          positionsLast5Min: 0,
          positionsLast1Hour: 0,
          positionsPerMinute: 0,
        };

    const recentErrors: ErrorSummaryEntity[] = errorRows.map((row) => ({
      type: row.type,
      count: Number(row.count),
      latestAt: row.latest_at,
    }));

    return {
      generatedAt: new Date(),
      deviceConnectivity,
      devices,
      ingestionRate,
      recentErrors,
    };
  }

  // ── Queries ─────────────────────────────────────────────────────────────────

  /**
   * Aggregated connectivity counts across all devices.
   * Uses idx_pt_device_status_last_seen (btree on last_seen_at).
   */
  private queryConnectivitySummary() {
    return this.prisma.$queryRaw<ConnectivitySummaryRow[]>(Prisma.sql`
      SELECT
        COUNT(*)::int                                                                      AS total_count,
        COUNT(*) FILTER (WHERE ds.last_seen_at > NOW() - INTERVAL '5 minutes')::int       AS online_count,
        COUNT(*) FILTER (
          WHERE ds.last_seen_at IS NOT NULL
            AND ds.last_seen_at <= NOW() - INTERVAL '5 minutes'
        )::int                                                                             AS offline_count,
        COUNT(*) FILTER (WHERE ds.last_seen_at IS NULL)::int                              AS never_seen_count,
        MAX(ds.last_seen_at)                                                               AS most_recent_connection
      FROM pt_device_status ds
    `);
  }

  /**
   * Per-device last_seen_at list, ordered by most recent first.
   * Uses idx_pt_device_status_last_seen + JOIN on unique device_id.
   */
  private queryDeviceLastSeen() {
    // TODO: For large fleets, consider pagination or limiting to recently active devices.
    return this.prisma.$queryRaw<DeviceLastSeenRow[]>(Prisma.sql`
      SELECT
        d.id                                                        AS device_id,
        d.imei,
        d.name,
        ds.last_seen_at,
        COALESCE(ds.last_seen_at > NOW() - INTERVAL '5 minutes', FALSE) AS is_online
      FROM pt_device_status ds
      JOIN pt_devices d ON d.id = ds.device_id
      ORDER BY ds.last_seen_at DESC NULLS LAST
    `);
  }

  /**
   * Position insert rate using device_time as ingestion proxy.
   * Uses idx_pt_positions_time_brin (BRIN on device_time) — efficient for recent time ranges.
   * Single-pass: scan once for 1-hour window, use FILTER for sub-intervals.
   */
  private queryIngestionRate() {
    return this.prisma.$queryRaw<IngestionRateRow[]>(Prisma.sql`
      SELECT
        COUNT(*) FILTER (WHERE device_time > NOW() - INTERVAL '1 minute')::int   AS positions_last_1min,
        COUNT(*) FILTER (WHERE device_time > NOW() - INTERVAL '5 minutes')::int  AS positions_last_5min,
        COUNT(*)::int                                                              AS positions_last_1hour,
        ROUND(
          COUNT(*) FILTER (WHERE device_time > NOW() - INTERVAL '5 minutes')::numeric / 5.0,
          2
        )                                                                          AS positions_per_minute
      FROM pt_positions
      WHERE device_time > NOW() - INTERVAL '1 hour'
    `);
  }

  /**
   * Error/alert events in the last hour, grouped by type.
   * Uses idx_pt_events_time_brin (BRIN on device_time) for range filter,
   * and idx_pt_events_type_time for type grouping.
   */
  private queryRecentErrors() {
    return this.prisma.$queryRaw<ErrorSummaryRow[]>(Prisma.sql`
      SELECT
        type::text  AS type,
        COUNT(*)::int AS count,
        MAX(device_time) AS latest_at
      FROM pt_events
      WHERE device_time > NOW() - INTERVAL '1 hour'
        AND type IN ('DEVICE_OFFLINE', 'LOW_BATTERY', 'OVERSPEED', 'VIBRATION', 'REMOVAL')
      GROUP BY type
      ORDER BY count DESC
    `);
  }
}
