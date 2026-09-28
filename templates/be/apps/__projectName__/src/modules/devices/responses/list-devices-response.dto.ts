import { createPaginationResponseDto } from '@app/core';
import { DeviceItemResponseDto } from './device-item-response.dto';

export class ListDevicesResponseDto extends createPaginationResponseDto(DeviceItemResponseDto) {}
