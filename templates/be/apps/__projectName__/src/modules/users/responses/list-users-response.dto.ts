import { createPaginationResponseDto } from '@app/core';
import { UserAdminItemResponseDto } from './user-admin-item-response.dto';

export class ListUsersResponseDto extends createPaginationResponseDto(UserAdminItemResponseDto) {}
