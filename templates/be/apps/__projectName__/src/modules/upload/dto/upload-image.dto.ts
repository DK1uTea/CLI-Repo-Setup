import { UploadFolder } from '@app/third-party';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class UploadImageDto {
  @ApiProperty({ enum: UploadFolder, example: UploadFolder.General })
  @IsEnum(UploadFolder)
  type: UploadFolder;
}
