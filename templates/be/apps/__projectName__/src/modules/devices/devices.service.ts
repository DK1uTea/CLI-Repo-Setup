import {
  Api400HttpError,
  Api404HttpError,
  Api409HttpError,
  awsConfiguration,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  resolveS3Url,
  resolveTenantReadScope,
  stripS3BaseUrl,
} from '@app/core';
import {
  DEVICE_STATUS_REPOSITORY,
  DEVICES_REPOSITORY,
  type IDeviceStatusRepository,
  type IDevicesRepository,
} from '@app/layer-data';
import { Inject, Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { DEVICE_ERROR_CODES } from './constants/devices.error-codes';
import { CreateDeviceDto, ListDevicesDto, UpdateDeviceDto } from './dto';
import {
  CreateDeviceResponseDto,
  DeleteDeviceResponseDto,
  DeviceDetailResponseDto,
  ListDevicesResponseDto,
  UpdateDeviceResponseDto,
} from './responses';

@Injectable()
export class DevicesService {
  constructor(
    @Inject(DEVICES_REPOSITORY)
    private readonly devicesRepo: IDevicesRepository,
    @Inject(DEVICE_STATUS_REPOSITORY)
    private readonly deviceStatusRepo: IDeviceStatusRepository,
    @Inject(awsConfiguration.KEY)
    private readonly awsConfig: ReturnType<typeof awsConfiguration>,
  ) {}

  async create(tenantId: string, dto: CreateDeviceDto): Promise<CreateDeviceResponseDto> {
    const existing = await this.devicesRepo.findByImei(dto.imei);
    if (existing) throw new Api409HttpError(DEVICE_ERROR_CODES.IMEI_ALREADY_EXISTS);

    const device = await this.devicesRepo.createDevice({
      imei: dto.imei,
      name: dto.name,
      internalId: dto.internalId,
      type: dto.type,
      avatar: stripS3BaseUrl(dto.avatar, this.awsConfig.s3BaseUrl) ?? undefined,
      tenantId,
    });
    return this.withResolvedAvatar(device);
  }

  async getById(tenantId: string, role: UserRole, id: string): Promise<DeviceDetailResponseDto> {
    // SUPER_ADMIN reads all tenants (undefined); operators get their visibility set; others their own tenant.
    const effectiveTenantId = resolveTenantReadScope({ tenantId, role });
    const [device, status] = await Promise.all([
      this.devicesRepo.findByIdAndTenantId(id, effectiveTenantId),
      this.deviceStatusRepo.findDeviceLatestPosition({ deviceId: id, tenantId: effectiveTenantId }),
    ]);
    if (!device) throw new Api404HttpError(DEVICE_ERROR_CODES.NOT_FOUND);

    return {
      ...this.withResolvedAvatar(device),
      isOnline: status?.state.isOnline ?? false,
      battery: status?.state.battery ?? null,
      gsmSignal: status?.state.gsmSignal ?? null,
      lastSeenAt: status?.state.lastSeenAt ?? null,
      location:
        status?.position.latitude != null && status?.position.longitude != null
          ? {
              address: status.position.address ?? null,
              latitude: status.position.latitude,
              longitude: status.position.longitude,
            }
          : null,
    };
  }

  async list(
    tenantId: string,
    role: UserRole,
    dto: ListDevicesDto,
  ): Promise<ListDevicesResponseDto> {
    const effectiveTenantId = resolveTenantReadScope({
      tenantId,
      role,
      requestedTenantId: dto.tenantId,
    });

    const result = await this.devicesRepo.list({
      tenantId: effectiveTenantId,
      page: dto.page ?? DEFAULT_PAGE,
      pageSize: dto.pageSize ?? DEFAULT_PAGE_SIZE,
      keyword: dto.keyword,
      type: dto.type,
    });

    const deviceIds = result.items.map((item) => item.id);
    const statusMap = await this.deviceStatusRepo.findStatusByDeviceIds(
      deviceIds,
      effectiveTenantId,
    );

    return {
      ...result,
      items: result.items.map((item) => {
        const status = statusMap.get(item.id);
        return {
          ...this.withResolvedAvatar(item),
          isOnline: status?.isOnline ?? false,
          battery: status?.battery ?? null,
          gsmSignal: status?.gsmSignal ?? null,
          location:
            status?.latitude != null && status?.longitude != null
              ? {
                  address: status.address ?? null,
                  latitude: status.latitude,
                  longitude: status.longitude,
                }
              : null,
          alertCount: Math.floor(Math.random() * 6),
        };
      }),
    };
  }

  async updateById(
    tenantId: string,
    id: string,
    dto: UpdateDeviceDto,
  ): Promise<UpdateDeviceResponseDto> {
    const hasPayload =
      dto.name !== undefined ||
      dto.internalId !== undefined ||
      dto.type !== undefined ||
      dto.avatar !== undefined;
    if (!hasPayload) throw new Api400HttpError(DEVICE_ERROR_CODES.UPDATE_EMPTY_PAYLOAD);

    // updateById tự enforce tenantId — trả null nếu không tìm thấy
    // TODO: delete old avatar from S3 if avatar is updated/removed?
    const updateData = {
      name: dto.name,
      internalId: dto.internalId,
      type: dto.type,
      avatar:
        dto.avatar !== undefined
          ? (stripS3BaseUrl(dto.avatar, this.awsConfig.s3BaseUrl) ?? undefined)
          : undefined,
    };

    const updated = await this.devicesRepo.updateById(id, tenantId, {
      name: updateData.name,
      internalId: updateData.internalId,
      type: updateData.type,
      avatar: updateData.avatar,
    });
    if (!updated) throw new Api404HttpError(DEVICE_ERROR_CODES.NOT_FOUND);

    return this.withResolvedAvatar(updated);
  }

  async deleteById(tenantId: string, id: string): Promise<DeleteDeviceResponseDto> {
    const deleted = await this.devicesRepo.deleteById(id, tenantId);
    if (!deleted) throw new Api404HttpError(DEVICE_ERROR_CODES.NOT_FOUND);
    return { success: true };
  }

  private withResolvedAvatar<T extends { avatar: string | null }>(item: T): T {
    return { ...item, avatar: resolveS3Url(item.avatar, this.awsConfig.s3BaseUrl) };
  }
}
