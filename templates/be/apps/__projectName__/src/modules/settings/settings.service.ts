import {
  Api400HttpError,
  Api404HttpError,
  awsConfiguration,
  resolveS3Url,
  stripS3BaseUrl,
} from '@app/core';
import {
  type ISettingsRepository,
  type IUsersRepository,
  SETTING_KEY,
  SETTINGS_REPOSITORY,
  USERS_REPOSITORY,
} from '@app/layer-data';
import { CACHE_KEYS, CacheService } from '@app/third-party';
import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { SETTINGS_ERROR_CODES } from './constants/settings.error-codes';
import type { ChangePasswordDto, UpdatePersonalInfoDto, UpsertUnknownDevicePolicyDto } from './dto';
import type {
  ChangePasswordResponseDto,
  UpdatePersonalInfoResponseDto,
  UpsertUnknownDevicePolicyResponseDto,
} from './responses';

@Injectable()
export class SettingsService {
  constructor(
    @Inject(SETTINGS_REPOSITORY)
    private readonly settingsRepository: ISettingsRepository,
    private readonly cacheService: CacheService,
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: IUsersRepository,
    @Inject(awsConfiguration.KEY)
    private readonly awsConfig: ReturnType<typeof awsConfiguration>,
  ) {}

  async upsertUnknownDevicePolicy(
    tenantId: string,
    userId: string,
    dto: UpsertUnknownDevicePolicyDto,
  ): Promise<UpsertUnknownDevicePolicyResponseDto> {
    const setting = await this.settingsRepository.upsertByTenantIdAndKey({
      tenantId,
      key: SETTING_KEY.UNKNOWN_DEVICE_POLICY_WHITELISTED,
      value: dto.imeis,
      updatedById: userId,
    });

    await this.cacheService.sReplaceAll(
      CACHE_KEYS.settings.unknownDevicePolicyWhitelist(tenantId),
      dto.imeis,
    );

    return setting;
  }

  async updatePersonalInfo(
    userId: string,
    dto: UpdatePersonalInfoDto,
  ): Promise<UpdatePersonalInfoResponseDto> {
    const hasPayload =
      dto.name !== undefined || dto.email !== undefined || dto.avatar !== undefined;

    if (!hasPayload) throw new Api400HttpError(SETTINGS_ERROR_CODES.UPDATE_EMPTY_PAYLOAD);

    const updatedUser = await this.usersRepository.updateById(userId, {
      name: dto.name,
      email: dto.email,
      avatar:
        dto.avatar !== undefined
          ? (stripS3BaseUrl(dto.avatar, this.awsConfig.s3BaseUrl) ?? undefined)
          : undefined,
    });
    if (!updatedUser) throw new Api404HttpError(SETTINGS_ERROR_CODES.SETTINGS_USER_NOT_FOUND);

    await this.cacheService.del(CACHE_KEYS.auth.me(userId));
    return this.withResolvedAvatar(updatedUser);
  }

  async updatePassword(userId: string, dto: ChangePasswordDto): Promise<ChangePasswordResponseDto> {
    const userCredential = await this.usersRepository.findCredentialById(userId);
    if (!userCredential) throw new Api404HttpError(SETTINGS_ERROR_CODES.SETTINGS_USER_NOT_FOUND);

    // SSO (Entra) users have no local password — password is managed by Microsoft.
    if (!userCredential.passwordHash) {
      throw new Api400HttpError(SETTINGS_ERROR_CODES.PASSWORD_NOT_SET);
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      userCredential.passwordHash,
    );
    if (!isCurrentPasswordValid) {
      throw new Api400HttpError(SETTINGS_ERROR_CODES.INVALID_CURRENT_PASSWORD);
    }

    const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.usersRepository.updatePasswordHashById(userId, newPasswordHash);

    return { success: true };
  }

  private withResolvedAvatar<T extends { avatar: string | null }>(item: T): T {
    return { ...item, avatar: resolveS3Url(item.avatar, this.awsConfig.s3BaseUrl) };
  }
}
