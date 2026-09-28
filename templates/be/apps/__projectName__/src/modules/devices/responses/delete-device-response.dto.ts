import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class DeleteDeviceResponseDto {
  @ApiProperty({ example: true })
  @Expose()
  success: boolean;
}
