import { haversineDistanceMeters } from '@app/core';
import {
  DEVICE_STATUS_REPOSITORY,
  DEVICES_REPOSITORY,
  type IDeviceStatusRepository,
  type IDevicesRepository,
  type IPositionsRepository,
  POSITIONS_REPOSITORY,
} from '@app/layer-data';
import { CACHE_KEYS, CacheService, GPS_QUEUE, GpsJobData } from '@app/third-party';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { DeviceType } from '@prisma/client';
import { Job } from 'bullmq';
import { GeocodingService } from '../../geocoding/geocoding.service';

// Chỉ ghi 1 row lịch sử vào pt_positions mỗi khi đủ 1 trong 2 điều kiện —
// tránh insert mỗi packet (thiết bị gửi mỗi 10s) làm hypertable phình quá nhanh.
// pt_device_status vẫn được cập nhật mỗi packet nên live map không bị ảnh hưởng.
const POSITION_SAVE_INTERVAL_SECONDS = 60;
const POSITION_SAVE_DISTANCE_METERS = 50;
const POSITION_SAVE_SPEED_DELTA_KPH = 10;
const POSITION_SAVE_HEADING_DELTA_DEGREES = 45;
const POSITION_SAVE_SATELLITES_DELTA = 2;
const POSITION_SAVE_CACHE_TTL_SECONDS = 5 * 60;

interface LastSavedPosition {
  lat: number;
  lon: number;
  deviceTime: string;
  speedKph?: number;
  heading?: number;
  satellites?: number;
}

/** So sánh 2 giá trị số — coi là "thay đổi đáng kể" nếu chênh lệch >= threshold, hoặc 1 trong 2 bên chưa từng có giá trị */
function hasSignificantChange(
  current: number | undefined,
  previous: number | undefined,
  threshold: number,
): boolean {
  if (current === undefined || previous === undefined) return current !== previous;
  return Math.abs(current - previous) >= threshold;
}

/** Như hasSignificantChange nhưng xử lý vòng tròn 0–360 độ (VD: 350° -> 10° chỉ lệch 20°, không phải 340°) */
function hasSignificantHeadingChange(
  current: number | undefined,
  previous: number | undefined,
  thresholdDegrees: number,
): boolean {
  if (current === undefined || previous === undefined) return current !== previous;
  const diff = Math.abs(current - previous) % 360;
  const circularDiff = diff > 180 ? 360 - diff : diff;
  return circularDiff >= thresholdDegrees;
}
/**
 * Tenant that owns devices auto-registered from the wire.
 * Pilot decision: every device that comes online (now or in the coming days) is assigned to the
 * CCEP (Coca-Cola) customer tenant. Prowerb staff see them via application-layer read visibility.
 */
const INGESTION_DEFAULT_TENANT_ID = 'coca-cola';

@Processor(GPS_QUEUE)
export class GpsProcessor extends WorkerHost {
  private readonly logger = new Logger(GpsProcessor.name);

  constructor(
    @Inject(DEVICES_REPOSITORY)
    private readonly devicesRepo: IDevicesRepository,
    @Inject(POSITIONS_REPOSITORY)
    private readonly positionsRepo: IPositionsRepository,
    private readonly cacheService: CacheService,
    @Inject(DEVICE_STATUS_REPOSITORY)
    private readonly deviceStatusRepo: IDeviceStatusRepository,
    private readonly geocodingService: GeocodingService,
  ) {
    super();
  }

  async process(job: Job<GpsJobData>): Promise<void> {
    const { data } = job;
    this.logger.log(`Processing GPS job [imei=${data.imei}] data=${JSON.stringify(data)}`);

    const device = await this.cacheService.getOrSet(CACHE_KEYS.device.byImei(data.imei), () =>
      this.devicesRepo.findOrCreateByImei(data.imei, {
        imei: data.imei,
        name: data.imei,
        // protocol: data.src,
        type: DeviceType.COOLER,
        tenantId: INGESTION_DEFAULT_TENANT_ID,
      }),
    );

    // Heartbeat (HTBT) carries the battery % and nothing else. GPS packets never
    // include battery, so persisting it from the heartbeat is the only path that
    // ever populates the battery column. Also refresh liveness on every heartbeat.
    if (data.type === 'heartbeat') {
      // Explicit presence check so a valid "0" (0 %) is not dropped by a truthy test.
      const parsed =
        data.battery !== undefined && data.battery !== '' ? parseInt(data.battery, 10) : NaN;
      const battery = Number.isNaN(parsed) ? undefined : parsed;
      await this.deviceStatusRepo.upsertByDeviceId(
        { deviceId: device.id },
        {
          ...(battery !== undefined ? { battery } : {}),
          lastSeenAt: new Date(),
        },
        { tenantId: device.tenantId },
      );
      this.logger.debug(`Heartbeat saved [imei=${data.imei}] battery=${battery ?? 'n/a'}`);
      return;
    }

    // Chỉ xử lý location/gps packet — bỏ qua ack, lbs, alarm
    if (data.type !== 'location' && data.type !== 'gps') return;
    if (!data.lat || !data.lon) return;

    const latitude = parseFloat(data.lat);
    const longitude = parseFloat(data.lon);
    const speedKph = data.speed ? parseFloat(data.speed) : undefined;
    const heading = data.course ? parseInt(data.course, 10) : undefined;
    const satellites = data.sats ? parseInt(data.sats, 10) : undefined;
    const gpsValid = data.gpsOk !== 'false';
    const deviceTime = new Date(data.ts);

    // Chỉ ghi history row khi đã lâu không lưu, HOẶC vị trí lệch đủ xa,
    // HOẶC speed/heading/satellites thay đổi vượt ngưỡng so với lần lưu trước
    const lastSavedKey = CACHE_KEYS.position.lastSaved(device.id);
    const lastSaved = await this.cacheService.get<LastSavedPosition>(lastSavedKey);

    const elapsedSeconds = lastSaved
      ? (deviceTime.getTime() - new Date(lastSaved.deviceTime).getTime()) / 1000
      : Infinity;
    const distanceMeters = lastSaved
      ? haversineDistanceMeters(lastSaved.lat, lastSaved.lon, latitude, longitude)
      : Infinity;
    const speedChanged = hasSignificantChange(
      speedKph,
      lastSaved?.speedKph,
      POSITION_SAVE_SPEED_DELTA_KPH,
    );
    const headingChanged = hasSignificantHeadingChange(
      heading,
      lastSaved?.heading,
      POSITION_SAVE_HEADING_DELTA_DEGREES,
    );
    const satellitesChanged = hasSignificantChange(
      satellites,
      lastSaved?.satellites,
      POSITION_SAVE_SATELLITES_DELTA,
    );
    const shouldSavePosition =
      elapsedSeconds >= POSITION_SAVE_INTERVAL_SECONDS ||
      distanceMeters >= POSITION_SAVE_DISTANCE_METERS ||
      speedChanged ||
      headingChanged ||
      satellitesChanged;

    // Chỉ geocode khi thực sự lưu — tránh gọi API bên ngoài cho mọi packet bị debounce
    let address: string | null | undefined;
    if (shouldSavePosition) {
      const geo = await this.geocodingService.reverse(latitude, longitude);
      address = geo?.formattedAddress ?? geo?.city ?? null;

      await this.positionsRepo.createOne({
        deviceId: device.id,
        tenantId: device.tenantId,
        deviceTime,
        address,
        latitude,
        longitude,
        speedKph,
        heading,
        satellites,
        gpsValid,
        rawPayload: data.raw ? { raw: data.raw } : undefined,
      });

      const toCache: LastSavedPosition = {
        lat: latitude,
        lon: longitude,
        deviceTime: deviceTime.toISOString(),
        speedKph,
        heading,
        satellites,
      };
      await this.cacheService.set(lastSavedKey, toCache, POSITION_SAVE_CACHE_TTL_SECONDS);
    }

    // Upsert device status mỗi packet — live map luôn real-time dù history bị debounce.
    // lastAddress chỉ set khi vừa geocode ở trên, nếu không thì giữ nguyên giá trị cũ trong DB.
    // Upsert device status — only include fields that are explicitly set
    // Note: battery is intentionally NOT set here. GPS packets never carry it,
    // and upsert treats a present-but-undefined field as an explicit null — which
    // would wipe the value persisted from the heartbeat on every position update.
    const deviceStatus = await this.deviceStatusRepo.upsertByDeviceId(
      { deviceId: device.id },
      {
        lastSeenAt: new Date(),
        ...(address !== undefined ? { lastAddress: address } : {}),
        lastLatitude: latitude,
        lastLongitude: longitude,
        lastSpeedKph: speedKph,
        lastHeading: heading,
        lastGpsValid: gpsValid,
        lastDeviceTime: deviceTime,
        // Note: lastGeom auto-populated by trigger from lastLatitude/lastLongitude
      },
      {
        tenantId: device.tenantId,
      },
    );

    this.logger.debug(
      `GPS packet processed [imei=${data.imei}] lat=${data.lat} lon=${data.lon} ` +
        `battery=${deviceStatus.battery} savedPosition=${shouldSavePosition}`,
    );
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job | undefined, error: Error): void {
    this.logger.error(
      `Job ${job?.id ?? 'unknown'} failed: ${error.message}`,
      job?.data,
      error.stack,
    );
  }
}
