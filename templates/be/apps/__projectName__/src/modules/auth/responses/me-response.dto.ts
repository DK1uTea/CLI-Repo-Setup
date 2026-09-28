import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class MeResponseDto {
  @ApiProperty({ example: 'cm7m2x3y40000a1b2c3d4e5f6' })
  @Expose()
  id!: string;

  @ApiProperty({ example: 'admin@protrack.com' })
  @Expose()
  email!: string;

  @ApiProperty({ example: 'Super Admin' })
  @Expose()
  name!: string;

  @ApiProperty({ example: 'SUPER_ADMIN' })
  @Expose()
  role!: string;

  @ApiPropertyOptional({
    example: 'https://bucket.s3.ap-southeast-1.amazonaws.com/uploads/avatars/avatar-abc123.png',
    nullable: true,
  })
  @Expose()
  avatar!: string | null;

  @ApiProperty({ example: 'cm7m2x3y40000z9y8x7w6v5u4' })
  @Expose()
  tenantId!: string;

  @ApiProperty({ example: 'APPROVED', enum: ['PENDING', 'APPROVED', 'REJECTED'] })
  @Expose()
  approvalStatus!: string;
}
