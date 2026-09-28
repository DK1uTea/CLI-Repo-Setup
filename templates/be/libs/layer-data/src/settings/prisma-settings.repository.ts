import { BaseRepository, PrismaService } from '@app/third-party';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { ISettingsRepository } from './settings.repository';
import type { SettingUpsertInput, SettingUpsertResult } from './settings.types';
import { SETTING_KEY } from './settings.types';

@Injectable()
export class PrismaSettingsRepository
  extends BaseRepository<PrismaService['setting']>
  implements ISettingsRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  protected get model(): PrismaService['setting'] {
    return this.prisma.setting;
  }

  async upsertByTenantIdAndKey(data: SettingUpsertInput): Promise<SettingUpsertResult> {
    const existing = await this.findFirst({
      where: { tenantId: data.tenantId, key: data.key },
      select: { id: true },
    });

    if (existing) {
      return this.update({
        where: { id: existing.id },
        data: {
          value: data.value as Prisma.InputJsonValue,
          updatedById: data.updatedById,
        },
        select: {
          value: true,
          updatedAt: true,
        },
      });
    }

    return this.create({
      data: {
        tenantId: data.tenantId,
        key: data.key,
        value: data.value as Prisma.InputJsonValue,
        updatedById: data.updatedById,
      },
      select: {
        value: true,
        updatedAt: true,
      },
    });
  }

  async findTenantIdByWhitelistedImei(imei: string): Promise<string | null> {
    // JSON containment: value::jsonb ? 'IMEI' — tìm tenant đầu tiên có IMEI trong mảng whitelist
    const rows = await this.prisma.$queryRaw<{ tenant_id: string }[]>`
      SELECT tenant_id
      FROM pt_settings
      WHERE key = ${SETTING_KEY.UNKNOWN_DEVICE_POLICY_WHITELISTED}
        AND tenant_id IS NOT NULL
        AND value::jsonb ? ${imei}
      LIMIT 1
    `;
    return rows[0]?.tenant_id ?? null;
  }
}
