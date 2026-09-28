import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class TenantDto {
  @ApiPropertyOptional({
    example: 'tenant_cuid',
    description: 'SUPER_ADMIN only: filter by tenantId',
  })
  @IsOptional()
  @IsString()
  tenantId?: string;
}
