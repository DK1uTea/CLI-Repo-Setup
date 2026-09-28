import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class MessageResponseDto {
  @ApiProperty({
    example: 'Operation completed successfully',
  })
  @Expose()
  message: string;
}
