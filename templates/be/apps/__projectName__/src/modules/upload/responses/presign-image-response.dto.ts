import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class PresignImageResponseDto {
  @ApiProperty({
    example: 'general/2026-04-17/abc123def456.jpg',
    description: 'S3 object key — lưu lại để reference sau',
  })
  @Expose()
  key: string;

  @ApiProperty({
    example:
      'https://bucket.s3.ap-southeast-1.amazonaws.com/general/2026-04-17/abc123.jpg?X-Amz-Algorithm=...',
    description: 'Presigned PUT URL — dùng để upload trực tiếp lên S3',
  })
  @Expose()
  url: string;
}
