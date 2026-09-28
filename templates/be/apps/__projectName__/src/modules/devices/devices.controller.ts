import { ApiSuccessResponse, RequireRoles, Serialize, User } from '@app/core';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { DevicesService } from './devices.service';
import { CreateDeviceDto, ListDevicesDto, UpdateDeviceDto } from './dto';
import {
  CreateDeviceResponseDto,
  DeleteDeviceResponseDto,
  DeviceDetailResponseDto,
  ListDevicesResponseDto,
  UpdateDeviceResponseDto,
} from './responses';

@ApiTags('Devices')
@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Get()
  @Serialize(ListDevicesResponseDto)
  @ApiOperation({ summary: 'Get list devices' })
  @ApiSuccessResponse(ListDevicesResponseDto, 'Get devices successful')
  list(
    @User('tenantId') tenantId: string,
    @User('role') role: UserRole,
    @Query() listDevicesDto: ListDevicesDto,
  ): Promise<ListDevicesResponseDto> {
    return this.devicesService.list(tenantId, role, listDevicesDto);
  }

  @Get(':id')
  @Serialize(DeviceDetailResponseDto)
  @ApiOperation({ summary: 'Get device by id' })
  @ApiSuccessResponse(DeviceDetailResponseDto, 'Get device successful')
  getById(
    @User('tenantId') tenantId: string,
    @User('role') role: UserRole,
    @Param('id') id: string,
  ): Promise<DeviceDetailResponseDto> {
    return this.devicesService.getById(tenantId, role, id);
  }

  @Post()
  @RequireRoles(UserRole.ADMIN)
  @Serialize(CreateDeviceResponseDto)
  @ApiOperation({ summary: 'Create a new device' })
  @ApiSuccessResponse(CreateDeviceResponseDto, 'Create device successful')
  create(
    @User('tenantId') tenantId: string,
    @Body() createDeviceDto: CreateDeviceDto,
  ): Promise<CreateDeviceResponseDto> {
    return this.devicesService.create(tenantId, createDeviceDto);
  }

  @Patch(':id')
  @RequireRoles(UserRole.ADMIN)
  @Serialize(UpdateDeviceResponseDto)
  @ApiOperation({ summary: 'Update device by id' })
  @ApiSuccessResponse(UpdateDeviceResponseDto, 'Update device successful')
  updateById(
    @User('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() updateDeviceDto: UpdateDeviceDto,
  ): Promise<UpdateDeviceResponseDto> {
    return this.devicesService.updateById(tenantId, id, updateDeviceDto);
  }

  @Delete(':id')
  @RequireRoles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete device by id' })
  @ApiSuccessResponse(DeleteDeviceResponseDto, 'Delete device successful')
  deleteById(
    @User('tenantId') tenantId: string,
    @Param('id') id: string,
  ): Promise<DeleteDeviceResponseDto> {
    return this.devicesService.deleteById(tenantId, id);
  }

  @Post(':id/command')
  @RequireRoles(UserRole.ADMIN)
  @Serialize(DeviceDetailResponseDto)
  @ApiOperation({ summary: 'Post command to device by id' })
  @ApiSuccessResponse(DeviceDetailResponseDto, 'Post command successful')
  postCommand(
    @User('tenantId') tenantId: string,
    @User('role') role: UserRole,
    @Param('id') id: string,
  ): Promise<DeviceDetailResponseDto> {
    return this.devicesService.getById(tenantId, role, id);
  }
}
