import type { KeywordPagingQuery, PaginatedResult } from '@app/core';
import type { DeviceRegistrationStatus, DeviceType } from '@prisma/client';

// ---------------------------------------------------------------------------
// Entity — shape của row DB trả về (toàn bộ column, không có relation)
// ---------------------------------------------------------------------------

export interface DeviceRow {
  id: string;
  imei: string;
  name: string;
  internalId: string | null;
  type: DeviceType;
  avatar: string | null;
  registrationStatus: DeviceRegistrationStatus;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Lightweight projection dùng cho paginated list — chỉ fetch đúng field cần
export type DeviceListItem = Pick<
  DeviceRow,
  'id' | 'imei' | 'name' | 'internalId' | 'type' | 'avatar' | 'createdAt'
>;

// ---------------------------------------------------------------------------
// Input types — dữ liệu đầu vào cho repository
// ---------------------------------------------------------------------------

export interface CreateDeviceInput {
  imei: string;
  name: string;
  internalId?: string;
  type: DeviceType;
  avatar?: string;
  tenantId: string;
}

export interface UpdateDeviceInput {
  name?: string;
  internalId?: string;
  type?: DeviceType;
  avatar?: string;
}

export interface ListDevicesFilter extends KeywordPagingQuery {
  /** undefined = lấy toàn bộ tenant (SUPER_ADMIN only); string[] = operator visibility set. */
  tenantId?: string | string[];
  type?: DeviceType;
}

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export type ListDevicesResult = PaginatedResult<DeviceListItem>;
