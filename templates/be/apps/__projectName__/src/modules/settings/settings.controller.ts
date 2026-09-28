import { ApiSuccessResponse, RequireRoles, Serialize, User } from '@app/core';
import { Body, Controller, Patch, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { ChangePasswordDto, UpdatePersonalInfoDto, UpsertUnknownDevicePolicyDto } from './dto';
import {
  ChangePasswordResponseDto,
  UpdatePersonalInfoResponseDto,
  UpsertUnknownDevicePolicyResponseDto,
} from './responses';
import { SettingsService } from './settings.service';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Put('unknown-device-policy/whitelisted')
  @RequireRoles(UserRole.ADMIN)
  @Serialize(UpsertUnknownDevicePolicyResponseDto)
  @ApiOperation({ summary: 'Upsert unknown device policy setting' })
  @ApiSuccessResponse(
    UpsertUnknownDevicePolicyResponseDto,
    'Upsert unknown device policy successful',
  )
  upsertUnknownDevicePolicy(
    @User('tenantId') tenantId: string,
    @User('sub') userId: string,
    @Body() dto: UpsertUnknownDevicePolicyDto,
  ): Promise<UpsertUnknownDevicePolicyResponseDto> {
    return this.settingsService.upsertUnknownDevicePolicy(tenantId, userId, dto);
  }

  @Patch('personal-info')
  @Serialize(UpdatePersonalInfoResponseDto)
  @ApiOperation({ summary: 'Update personal info' })
  @ApiSuccessResponse(UpdatePersonalInfoResponseDto, 'Update personal info successful')
  updatePersonalInfo(
    @User('sub') userId: string,
    @Body() dto: UpdatePersonalInfoDto,
  ): Promise<UpdatePersonalInfoResponseDto> {
    return this.settingsService.updatePersonalInfo(userId, dto);
  }

  @Patch('password')
  @Serialize(ChangePasswordResponseDto)
  @ApiOperation({ summary: 'Change password' })
  @ApiSuccessResponse(ChangePasswordResponseDto, 'Change password successful')
  updatePassword(
    @User('sub') userId: string,
    @Body() dto: ChangePasswordDto,
  ): Promise<ChangePasswordResponseDto> {
    return this.settingsService.updatePassword(userId, dto);
  }
}
