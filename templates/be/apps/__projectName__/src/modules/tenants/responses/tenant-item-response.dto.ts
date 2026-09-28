import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class TenantItemResponseDto {
  @ApiProperty({ example: 'cmab8d9hh0000zsi0w8kc24q9' })
  @Expose()
  id!: string;

  @ApiProperty({ example: 'Default Tenant' })
  @Expose()
  name!: string;
}
