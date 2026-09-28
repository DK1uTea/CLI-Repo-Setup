import type { SettingUpsertInput, SettingUpsertResult } from './settings.types';

export const SETTINGS_REPOSITORY = Symbol('SETTINGS_REPOSITORY');

export interface ISettingsRepository {
  upsertByTenantIdAndKey(data: SettingUpsertInput): Promise<SettingUpsertResult>;

  /**
   * Tìm tenantId đầu tiên có IMEI trong danh sách whitelist unknown-device-policy.
   * Dùng cho worker khi auto-create device chưa đăng ký.
   * Trả null nếu IMEI không nằm trong whitelist của bất kỳ tenant nào.
   */
  findTenantIdByWhitelistedImei(imei: string): Promise<string | null>;
}

export type { SettingUpsertInput, SettingUpsertResult };
