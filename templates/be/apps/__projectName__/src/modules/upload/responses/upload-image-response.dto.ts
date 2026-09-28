import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UploadImageResponseDto {
  @ApiProperty({ example: 'images/3f1a2b4c-uuid.jpg', description: 'S3 object key' })
  @Expose()
  path: string;

  @ApiProperty({
    example: 'https://bucket.s3.ap-southeast-1.amazonaws.com/images/3f1a2b4c-uuid.jpg',
    description: 'Public URL of the uploaded image',
  })
  @Expose()
  url: string;
}
