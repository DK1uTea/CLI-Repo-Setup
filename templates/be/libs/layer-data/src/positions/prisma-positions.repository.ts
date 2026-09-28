import { PrismaService } from '@app/third-party';
import { Injectable } from '@nestjs/common';

import type { IPositionsRepository } from './positions.repository';
import type {
  CreatePositionInput,
  ListPositionHistoryQuery,
  PositionHistoryCursorPayload,
  PositionHistoryEntity,
  PositionHistoryPageResult,
  PositionStateSnapshot,
} from './positions.types';

@Injectable()
export class PrismaPositionsRepository implements IPositionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  private decodeCursor(cursor: string): PositionHistoryCursorPayload {
    try {
      const decoded = Buffer.from(cursor, 'base64').toString('utf8');
      return JSON.parse(decoded);
    } catch {
      return { deviceTime: '', id: '0' };
    }
  }

  private encodeCursor(payload: PositionHistoryCursorPayload): string {
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  async createOne(input: CreatePositionInput): Promise<void> {
    // Dùng $executeRaw thay vì prisma.position.create() vì model Position có column
    // `geom Unsupported("geography(Point,4326)")` khiến Prisma disable toàn bộ write ops.
    // geom được populate tự động qua DB trigger trg_pt_positions_geom — không cần truyền vào.
    await this.prisma.$executeRaw`
      INSERT INTO pt_positions (
        device_id, tenant_id, device_time,
        address,
        latitude, longitude,
        accuracy, altitude, speed_kph, heading, satellites,
        gps_valid, raw_payload
      ) VALUES (
        ${input.deviceId}, ${input.tenantId}, ${input.deviceTime},
        ${input.address ?? null},
        ${input.latitude}, ${input.longitude},
        ${input.accuracy ?? null}, ${input.altitude ?? null},
        ${input.speedKph ?? null}, ${input.heading ?? null}, ${input.satellites ?? null},
        ${input.gpsValid},
        ${input.rawPayload !== undefined ? JSON.stringify(input.rawPayload) : null}::jsonb
      )
    `;
  }

  async findHistory(query: ListPositionHistoryQuery): Promise<PositionHistoryPageResult> {
    const { deviceId, tenantId, from, to, limit: requestLimit, cursor: cursorStr } = query;

    const limit = Math.min(requestLimit ?? 10, 100);
    const decodedCursor = cursorStr ? this.decodeCursor(cursorStr) : null;

    // Normalise the tenant scope for raw SQL: null = SUPER_ADMIN (predicate skipped), otherwise a
    // comma-joined list bound as a scalar and split via string_to_array — one tenant, or an operator
    // cross-tenant visibility set. Internal tenant ids never contain commas.
    const tenantScopeCsv: string | null =
      tenantId === undefined ? null : (Array.isArray(tenantId) ? tenantId : [tenantId]).join(',');

    /**
     * Cursor-based keyset pagination with daily cap (5 records per UTC day).
     * CRITICAL: Rank first (cap 5/day), then apply cursor filter.
     * This prevents re-ranking which would break consistency across pages.
     */
    const cursorCondition =
      decodedCursor && decodedCursor.deviceTime
        ? `AND (device_time, id) < ('${decodedCursor.deviceTime}'::timestamp, ${BigInt(decodedCursor.id)})`
        : '';

    const cappedRows = await this.prisma.$queryRawUnsafe<
      Array<{
        id: bigint;
        device_time: Date;
        address: string | null;
        latitude: any;
        longitude: any;
        accuracy: number | null;
        altitude: number | null;
        speed_kph: number | null;
        heading: number | null;
        satellites: number | null;
        gps_valid: boolean;
        state: unknown;
      }>
    >(
      `
      WITH ranked_positions AS (
        SELECT id, device_time, address, latitude, longitude, accuracy, altitude, speed_kph,
               heading, satellites, gps_valid, state,
               ROW_NUMBER() OVER (
                 PARTITION BY DATE(device_time AT TIME ZONE 'UTC')
                 ORDER BY device_time DESC, id DESC
               ) AS day_rank
        FROM pt_positions p
        WHERE p.device_id = $1
          AND ($2::text IS NULL OR p.tenant_id = ANY(string_to_array($2, ',')))
          AND p.device_time >= $3
          AND p.device_time <= $4
      ),
      capped_positions AS (
         SELECT id, device_time, address, latitude, longitude, accuracy, altitude, speed_kph,
           heading, satellites, gps_valid, state
        FROM ranked_positions
        WHERE day_rank <= 5
          ${cursorCondition}
      )
            SELECT id, device_time, address, latitude, longitude, accuracy, altitude, speed_kph,
              heading, satellites, gps_valid, state
      FROM capped_positions
      ORDER BY device_time DESC, id DESC
      LIMIT $5
      `,
      deviceId,
      // null = SUPER_ADMIN cross-tenant (predicate skipped); else a CSV of one-or-more tenant ids.
      tenantScopeCsv,
      from,
      to,
      limit + 1,
    );

    // Determine hasMore and slice to limit
    const items = cappedRows.slice(0, limit);
    const hasMore = cappedRows.length > limit;

    // Map to response entities
    const resultItems: PositionHistoryEntity[] = items.map((row) => {
      const latitude =
        typeof row.latitude === 'object' && row.latitude !== null && 'toNumber' in row.latitude
          ? (row.latitude as any).toNumber()
          : Number(row.latitude);
      const longitude =
        typeof row.longitude === 'object' && row.longitude !== null && 'toNumber' in row.longitude
          ? (row.longitude as any).toNumber()
          : Number(row.longitude);

      return {
        deviceTime: row.device_time,
        address: row.address,
        latitude,
        longitude,
        accuracy: row.accuracy,
        altitude: row.altitude,
        speedKph: row.speed_kph,
        heading: row.heading,
        satellites: row.satellites,
        gpsValid: row.gps_valid,
        state: row.state ? (row.state as unknown as PositionStateSnapshot) : null,
      };
    });

    // Compute nextCursor from last item if hasMore
    let nextCursor: string | null = null;
    if (hasMore && items.length > 0) {
      const lastItem = items[items.length - 1];
      nextCursor = this.encodeCursor({
        deviceTime: lastItem.device_time.toISOString(),
        id: lastItem.id.toString(),
      });
    }

    return {
      items: resultItems,
      nextCursor: nextCursor || undefined,
      hasMore,
    };
  }
}
