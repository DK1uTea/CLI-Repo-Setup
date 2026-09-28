import { BaseRepository, PrismaService } from '@app/third-party';
import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { IDevicesRepository } from './devices.repository';
import type {
  CreateDeviceInput,
  DeviceListItem,
  DeviceRow,
  ListDevicesFilter,
  ListDevicesResult,
  UpdateDeviceInput,
} from './devices.types';

// ---------------------------------------------------------------------------
// Select constants — định nghĩa 1 lần, dùng nhiều nơi.
// Không bao giờ SELECT * — chỉ fetch đúng field cần.
// ---------------------------------------------------------------------------

const DEVICE_FULL_SELECT = {
  id: true,
  imei: true,
  name: true,
  internalId: true,
  type: true,
  avatar: true,
  registrationStatus: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.DeviceSelect;

/** Lightweight select cho list view — bỏ những field không cần trong danh sách */
const DEVICE_LIST_SELECT = {
  id: true,
  imei: true,
  name: true,
  internalId: true,
  type: true,
  avatar: true,
  createdAt: true,
} as const satisfies Prisma.DeviceSelect;

// ---------------------------------------------------------------------------
// Repository
// ---------------------------------------------------------------------------

@Injectable()
export class PrismaDevicesRepository
  extends BaseRepository<PrismaService['device']>
  implements IDevicesRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  protected get model(): PrismaService['device'] {
    return this.prisma.device;
  }

  // -------------------------------------------------------------------------
  // Read
  // -------------------------------------------------------------------------

  findByImei(imei: string): Promise<DeviceRow | null> {
    return this.findUnique({
      where: { imei },
      select: DEVICE_FULL_SELECT,
    }) as Promise<DeviceRow | null>;
  }

  findByIdAndTenantId(id: string, tenantId?: string | string[]): Promise<DeviceRow | null> {
    // undefined = SUPER_ADMIN; string = one tenant; string[] = operator visibility set.
    const where: Prisma.DeviceWhereInput = { id };
    if (tenantId !== undefined)
      where.tenantId = Array.isArray(tenantId) ? { in: tenantId } : tenantId;

    return this.findFirst({
      where,
      select: DEVICE_FULL_SELECT,
    }) as Promise<DeviceRow | null>;
  }

  findManyByIds(ids: string[], tenantId: string): Promise<DeviceRow[]> {
    if (ids.length === 0) return Promise.resolve([]);

    return this.findMany({
      where: { id: { in: ids }, tenantId },
      select: DEVICE_FULL_SELECT,
    }) as Promise<DeviceRow[]>;
  }

  existsByIdAndTenantId(id: string, tenantId: string): Promise<boolean> {
    return this.exists({ id, tenantId });
  }

  async list(filter: ListDevicesFilter): Promise<ListDevicesResult> {
    const where = this.buildListWhere(filter);

    const { items, pagination } = await this.findPagination(
      {
        where,
        orderBy: { updatedAt: 'desc' },
        select: DEVICE_LIST_SELECT,
      },
      { page: filter.page, pageSize: filter.pageSize },
    );

    return { items: items as DeviceListItem[], pagination };
  }

  // -------------------------------------------------------------------------
  // Write
  // -------------------------------------------------------------------------

  createDevice(data: CreateDeviceInput): Promise<DeviceRow> {
    // Dùng this.model.create thay vì this.create để tránh xung đột tên với BaseRepository.
    return this.model.create({ data, select: DEVICE_FULL_SELECT }) as Promise<DeviceRow>;
  }

  findOrCreateByImei(imei: string, data: CreateDeviceInput): Promise<DeviceRow> {
    return this.model.upsert({
      where: { imei },
      create: data,
      update: {},
      select: DEVICE_FULL_SELECT,
    }) as Promise<DeviceRow>;
  }

  async updateById(
    id: string,
    tenantId: string,
    data: UpdateDeviceInput,
  ): Promise<DeviceRow | null> {
    // Atomic: updateMany với compound where (id + tenantId).
    // Nếu device không tồn tại hoặc sai tenant → count = 0 → trả null.
    // Tránh 2-step (find + update) để không race condition.
    const result = await this.prisma.device.updateMany({ where: { id, tenantId }, data });
    if (result.count === 0) return null;

    // Re-fetch để trả về row đầy đủ sau khi update
    return this.findByIdAndTenantId(id, tenantId);
  }

  async deleteById(id: string, tenantId: string): Promise<boolean> {
    // Atomic: xoá chính xác row với cả id lẫn tenantId.
    const result = await this.prisma.device.deleteMany({ where: { id, tenantId } });
    return result.count > 0;
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  private buildListWhere(filter: ListDevicesFilter): Prisma.DeviceWhereInput {
    const where: Prisma.DeviceWhereInput = {};

    if (filter.tenantId !== undefined)
      where.tenantId = Array.isArray(filter.tenantId) ? { in: filter.tenantId } : filter.tenantId;
    if (filter.type !== undefined) where.type = filter.type;

    const keyword = filter.keyword;
    if (keyword) {
      where.OR = [
        { name: { contains: keyword, mode: 'insensitive' } },
        { imei: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    return where;
  }
}
