import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuthProvider, UserApprovalStatus, UserRole } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserAdminItemResponseDto {
  @ApiProperty({ example: 'cmab8d9hh0000zsi0w8kc24q9' })
  @Expose()
  id!: string;

  @ApiProperty({ example: 'jane.doe@coca-cola.com' })
  @Expose()
  email!: string;

  @ApiProperty({ example: 'Jane Doe' })
  @Expose()
  name!: string;

  @ApiPropertyOptional({ example: null, nullable: true })
  @Expose()
  avatar!: string | null;

  @ApiProperty({ enum: UserRole, example: UserRole.USER })
  @Expose()
  role!: UserRole;

  @ApiProperty({ example: 'coca-cola' })
  @Expose()
  tenantId!: string;

  @ApiProperty({ example: true })
  @Expose()
  isActive!: boolean;

  @ApiProperty({ enum: AuthProvider, example: AuthProvider.ENTRA })
  @Expose()
  authProvider!: AuthProvider;

  @ApiProperty({ enum: UserApprovalStatus, example: UserApprovalStatus.PENDING })
  @Expose()
  approvalStatus!: UserApprovalStatus;

  @ApiProperty({ example: '2026-07-07T08:30:00.000Z' })
  @Expose()
  createdAt!: Date;
}
