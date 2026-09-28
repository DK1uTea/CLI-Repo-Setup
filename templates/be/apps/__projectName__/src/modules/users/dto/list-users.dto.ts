import { PagingDto, TenantDto } from '@app/core';
import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { UserApprovalStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class ListUsersDto extends IntersectionType(PagingDto, TenantDto) {
  @ApiPropertyOptional({ enum: UserApprovalStatus, example: UserApprovalStatus.PENDING })
  @IsOptional()
  @IsEnum(UserApprovalStatus)
  approvalStatus?: UserApprovalStatus;
}
