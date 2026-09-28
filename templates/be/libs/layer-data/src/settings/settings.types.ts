export const SETTING_KEY = {
  UNKNOWN_DEVICE_POLICY_WHITELISTED: 'unknown_device_policy.whitelisted',
} as const;

export interface SettingEntity {
  id: string;
  tenantId: string | null;
  key: string;
  value: unknown;
  updatedAt: Date;
  updatedById: string | null;
}

export interface SettingUpsertInput {
  tenantId: string;
  key: string;
  value: unknown;
  updatedById: string;
}

export interface SettingUpsertResult {
  value: unknown;
  updatedAt: Date;
}
