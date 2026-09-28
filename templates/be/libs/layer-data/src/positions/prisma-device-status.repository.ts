import { BaseRepository, PrismaService } from '@app/third-party';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import dayjs from 'dayjs';
import type { IDeviceStatusRepository } from './positions.repository';
import type {
  DeviceStatusEntity,
  DeviceStatusSummary,
  GetDeviceLatestPositionQuery,
  GetLiveMapPositionsQuery,
  LatestPositionEntity,
  ListLatestPositionsQuery,
  ListLatestPositionsResult,
  UpsertDeviceStatusInput,
} from './positions.types';

/** Threshold in minutes to consider device online */
const ONLINE_THRESHOLD_MINUTES = 5;

interface DeviceStatusWithDevice {
  deviceId: string;
  battery: number | null;
  batteryVoltage: Prisma.Decimal | null;
  gsmSignal: number | null;
  lastSeenAt: Date | null;
  lastAddress: string | null;
  lastDeviceTime: Date | null;
  lastLatitude: Prisma.Decimal | null;
  lastLongitude: Prisma.Decimal | null;
  lastSpeedKph: number | null;
  lastHeading: number | null;
  lastGpsValid: boolean | null;
  device: {
    id: string;
    internalId: string;
    name: string;
    imei: string;
  };
}

type DeviceStatusRow = Prisma.DeviceStatusGetPayload<{}> & {
  lastAddress: string | null;
};

@Injectable()
export class PrismaDeviceStatusRepository
  extends BaseRepository<PrismaService['deviceStatus']>
  implements IDeviceStatusRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  protected get model(): PrismaService['deviceStatus'] {
    return this.prisma.deviceStatus;
  }

  private isDeviceOnline(lastSeenAt: Date | null): boolean {
    return (
      lastSeenAt !== null && dayjs().diff(dayjs(lastSeenAt), 'minute') <= ONLINE_THRESHOLD_MINUTES
    );
  }

  private mapToLatestPosition(row: DeviceStatusWithDevice): LatestPositionEntity {
    return {
      device: {
        id: row.device.id,
        name: row.device.name,
        imei: row.device.imei,
        internalId: row.device.internalId,
      },
      state: {
        battery: row.battery,
        batteryVoltage: row.batteryVoltage ? row.batteryVoltage.toNumber() : null,
        gsmSignal: row.gsmSignal,
        lastSeenAt: row.lastSeenAt,
        isOnline: this.isDeviceOnline(row.lastSeenAt),
      },
      position: {
        deviceTime: row.lastDeviceTime,
        address: row.lastAddress,
        latitude: row.lastLatitude ? row.lastLatitude.toNumber() : null,
        longitude: row.lastLongitude ? row.lastLongitude.toNumber() : null,
        speedKph: row.lastSpeedKph,
        heading: row.lastHeading,
        gpsValid: row.lastGpsValid,
      },
    };
  }

  async findLatestPerDevice(query: ListLatestPositionsQuery): Promise<ListLatestPositionsResult> {
    const { tenantId, page, pageSize } = query;

    // undefined = SUPER_ADMIN (no filter); string = one tenant; string[] = operator visibility set.
    const where: Prisma.DeviceStatusWhereInput = {};
    if (tenantId !== undefined)
      where.tenantId = Array.isArray(tenantId) ? { in: tenantId } : tenantId;

    const result = await this.findPagination(
      {
        where,
        orderBy: { lastDeviceTime: { sort: 'desc', nulls: 'last' } },
        include: {
          device: { select: { id: true, name: true, imei: true } },
        },
      },
      { page, pageSize },
    );

    const rows = result.items as unknown as DeviceStatusWithDevice[];

    return {
      items: rows.map((row) => this.mapToLatestPosition(row)),
      pagination: result.pagination,
    };
  }

  async findLiveMapPositions(query: GetLiveMapPositionsQuery): Promise<LatestPositionEntity[]> {
    const { tenantId, deviceIds } = query;

    // undefined = SUPER_ADMIN (no filter); string = one tenant; string[] = operator visibility set.
    const whereClause: Prisma.DeviceStatusWhereInput = {};
    if (tenantId !== undefined)
      whereClause.tenantId = Array.isArray(tenantId) ? { in: tenantId } : tenantId;

    if (deviceIds && deviceIds.length > 0) {
      whereClause.deviceId = { in: deviceIds };
    }

    const rows = await this.findMany({
      where: whereClause,
      orderBy: { lastDeviceTime: { sort: 'desc', nulls: 'last' } },
      include: {
        device: { select: { id: true, name: true, imei: true, internalId: true } },
      },
    });

    return (rows as unknown as DeviceStatusWithDevice[]).map((row) =>
      this.mapToLatestPosition(row),
    );
  }

  async findDeviceLatestPosition(
    query: GetDeviceLatestPositionQuery,
  ): Promise<LatestPositionEntity | null> {
    const { tenantId, deviceId } = query;

    // undefined = SUPER_ADMIN; string = one tenant; string[] = operator visibility set. deviceId is unique 1:1.
    const where: Prisma.DeviceStatusWhereInput = { deviceId };
    if (tenantId !== undefined)
      where.tenantId = Array.isArray(tenantId) ? { in: tenantId } : tenantId;

    const row = await this.findFirst({
      where,
      include: {
        device: { select: { id: true, name: true, imei: true } },
      },
    });

    if (!row) return null;

    return this.mapToLatestPosition(row as unknown as DeviceStatusWithDevice);
  }

  async findStatusByDeviceIds(
    deviceIds: string[],
    tenantId?: string | string[],
  ): Promise<Map<string, DeviceStatusSummary>> {
    if (deviceIds.length === 0) return new Map();

    const where: Prisma.DeviceStatusWhereInput = { deviceId: { in: deviceIds } };
    if (tenantId !== undefined)
      where.tenantId = Array.isArray(tenantId) ? { in: tenantId } : tenantId;

    const rows = (await this.findMany({
      where,
      select: {
        deviceId: true,
        battery: true,
        gsmSignal: true,
        lastSeenAt: true,
        lastAddress: true,
        lastLatitude: true,
        lastLongitude: true,
      },
    })) as unknown as Array<{
      deviceId: string;
      battery: number | null;
      gsmSignal: number | null;
      lastSeenAt: Date | null;
      lastAddress: string | null;
      lastLatitude: Prisma.Decimal | null;
      lastLongitude: Prisma.Decimal | null;
    }>;

    const map = new Map<string, DeviceStatusSummary>();
    for (const row of rows) {
      map.set(row.deviceId, {
        deviceId: row.deviceId,
        isOnline: this.isDeviceOnline(row.lastSeenAt),
        battery: row.battery,
        gsmSignal: row.gsmSignal,
        address: row.lastAddress,
        latitude: row.lastLatitude ? row.lastLatitude.toNumber() : null,
        longitude: row.lastLongitude ? row.lastLongitude.toNumber() : null,
      });
    }

    return map;
  }

  async upsertByDeviceId(
    where: { deviceId: string },
    data: UpsertDeviceStatusInput,
    updateContext: { tenantId: string },
  ): Promise<DeviceStatusEntity> {
    const { deviceId } = where;
    const { tenantId } = updateContext;

    // Build update data object — include fields if they are present in `data`.
    // If a field is present but explicitly `undefined`, we set it to `null` to overwrite previous value.
    const present = (key: keyof UpsertDeviceStatusInput) => Object.hasOwn(data, key as string);

    const updateData: Prisma.DeviceStatusUpdateInput & { lastAddress?: string | null } = {};
    if (present('battery')) updateData.battery = data.battery === undefined ? null : data.battery;
    if (present('batteryVoltage'))
      updateData.batteryVoltage = data.batteryVoltage === undefined ? null : data.batteryVoltage;
    if (present('gsmSignal'))
      updateData.gsmSignal = data.gsmSignal === undefined ? null : data.gsmSignal;
    if (present('lastSeenAt'))
      updateData.lastSeenAt = data.lastSeenAt === undefined ? null : data.lastSeenAt;
    if (present('lastAddress'))
      updateData.lastAddress = data.lastAddress === undefined ? null : data.lastAddress;
    if (present('lastLatitude'))
      updateData.lastLatitude = data.lastLatitude === undefined ? null : (data.lastLatitude as any);
    if (present('lastLongitude'))
      updateData.lastLongitude =
        data.lastLongitude === undefined ? null : (data.lastLongitude as any);
    if (present('lastSpeedKph'))
      updateData.lastSpeedKph = data.lastSpeedKph === undefined ? null : data.lastSpeedKph;
    if (present('lastHeading'))
      updateData.lastHeading = data.lastHeading === undefined ? null : data.lastHeading;
    if (present('lastGpsValid'))
      updateData.lastGpsValid = data.lastGpsValid === undefined ? null : data.lastGpsValid;
    if (present('lastDeviceTime'))
      updateData.lastDeviceTime = data.lastDeviceTime === undefined ? null : data.lastDeviceTime;

    // Build create data object — only include fields that are explicitly present
    const createData: Prisma.DeviceStatusUncheckedCreateInput = {
      deviceId,
      tenantId,
    } as Prisma.DeviceStatusUncheckedCreateInput;

    if (present('battery'))
      (createData as any).battery = data.battery === undefined ? null : data.battery;
    if (present('batteryVoltage'))
      (createData as any).batteryVoltage =
        data.batteryVoltage === undefined ? null : data.batteryVoltage;
    if (present('gsmSignal'))
      (createData as any).gsmSignal = data.gsmSignal === undefined ? null : data.gsmSignal;
    if (present('lastSeenAt'))
      (createData as any).lastSeenAt = data.lastSeenAt === undefined ? null : data.lastSeenAt;
    if (present('lastAddress'))
      (createData as any).lastAddress = data.lastAddress === undefined ? null : data.lastAddress;
    if (present('lastLatitude'))
      (createData as any).lastLatitude = data.lastLatitude === undefined ? null : data.lastLatitude;
    if (present('lastLongitude'))
      (createData as any).lastLongitude =
        data.lastLongitude === undefined ? null : data.lastLongitude;
    if (present('lastSpeedKph'))
      (createData as any).lastSpeedKph = data.lastSpeedKph === undefined ? null : data.lastSpeedKph;
    if (present('lastHeading'))
      (createData as any).lastHeading = data.lastHeading === undefined ? null : data.lastHeading;
    if (present('lastGpsValid'))
      (createData as any).lastGpsValid = data.lastGpsValid === undefined ? null : data.lastGpsValid;
    if (present('lastDeviceTime'))
      (createData as any).lastDeviceTime =
        data.lastDeviceTime === undefined ? null : data.lastDeviceTime;

    // Note: lastGeom is auto-populated by trigger from lastLatitude/lastLongitude — don't set manually
    const result = await this.model.upsert({
      where: { deviceId },
      update: updateData,
      create: createData as any,
    });

    return this.mapToDomainEntity(result as unknown as DeviceStatusRow);
  }

  private mapToDomainEntity(row: DeviceStatusRow): DeviceStatusEntity {
    return {
      id: row.id,
      deviceId: row.deviceId,
      tenantId: row.tenantId,
      battery: row.battery,
      batteryVoltage: row.batteryVoltage ? row.batteryVoltage.toNumber() : null,
      gsmSignal: row.gsmSignal,
      lastSeenAt: row.lastSeenAt,
      lastAddress: row.lastAddress,
      lastLatitude: row.lastLatitude ? row.lastLatitude.toNumber() : null,
      lastLongitude: row.lastLongitude ? row.lastLongitude.toNumber() : null,
      lastSpeedKph: row.lastSpeedKph,
      lastHeading: row.lastHeading,
      lastGpsValid: row.lastGpsValid,
      lastDeviceTime: row.lastDeviceTime,
    };
  }
}
