import { ApiSuccessResponse, RequireRoles, Serialize } from '@app/core';
import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { TenantItemResponseDto } from './responses';
import { TenantsService } from './tenants.service';

@ApiTags('Tenants')
@RequireRoles(UserRole.SUPER_ADMIN)
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  @Serialize(TenantItemResponseDto)
  @ApiOperation({ summary: 'Get list tenants (SUPER_ADMIN only)' })
  @ApiSuccessResponse(TenantItemResponseDto, 'Get tenants successful', true)
  list(): Promise<TenantItemResponseDto[]> {
    return this.tenantsService.list();
  }
}
