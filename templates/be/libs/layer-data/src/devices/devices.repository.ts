import type {
  CreateDeviceInput,
  DeviceListItem,
  DeviceRow,
  ListDevicesFilter,
  ListDevicesResult,
  UpdateDeviceInput,
} from './devices.types';

export const DEVICES_REPOSITORY = Symbol('DEVICES_REPOSITORY');

export interface IDevicesRepository {
  /**
   * Tìm device theo IMEI (global — không có tenantId filter).
   * Dùng để check duplicate trước khi create/update.
   */
  findByImei(imei: string): Promise<DeviceRow | null>;

  /**
   * Tìm device theo id, enforce tenantId.
   * tenantId = undefined → cross-tenant (SUPER_ADMIN only); string[] → operator visibility set.
   * Trả null nếu không tồn tại hoặc ngoài phạm vi tenant.
   */
  findByIdAndTenantId(id: string, tenantId?: string | string[]): Promise<DeviceRow | null>;

  /**
   * Batch lookup theo danh sách id, enforce tenantId.
   * Dùng cho live map, bulk operations — tránh N+1.
   */
  findManyByIds(ids: string[], tenantId: string): Promise<DeviceRow[]>;

  /** Danh sách devices phân trang với lightweight projection. */
  list(filter: ListDevicesFilter): Promise<ListDevicesResult>;

  createDevice(data: CreateDeviceInput): Promise<DeviceRow>;

  /**
   * Tìm device theo IMEI, nếu chưa có thì tạo mới với `data`.
   * Atomic upsert — an toàn khi nhiều packet cùng IMEI đến đồng thời.
   */
  findOrCreateByImei(imei: string, data: CreateDeviceInput): Promise<DeviceRow>;

  /**
   * Update atomic theo id + tenantId.
   * Trả null nếu device không tồn tại hoặc sai tenant.
   */
  updateById(id: string, tenantId: string, data: UpdateDeviceInput): Promise<DeviceRow | null>;

  /**
   * Xoá atomic theo id + tenantId.
   * Trả false nếu device không tồn tại hoặc sai tenant.
   */
  deleteById(id: string, tenantId: string): Promise<boolean>;

  /** Kiểm tra device có thuộc tenant không — dùng cho guard/middleware. */
  existsByIdAndTenantId(id: string, tenantId: string): Promise<boolean>;
}

// Re-export types để consumer import từ 1 chỗ
export type {
  CreateDeviceInput,
  DeviceListItem,
  DeviceRow,
  ListDevicesFilter,
  ListDevicesResult,
  UpdateDeviceInput,
};
