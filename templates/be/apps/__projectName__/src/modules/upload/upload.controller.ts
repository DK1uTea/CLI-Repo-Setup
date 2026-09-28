import { ApiSuccessResponse, Serialize } from '@app/core';
import { UploadFolder } from '@app/third-party';
import { Body, Controller, Get, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PresignImageDto, UploadImageDto } from './dto';
import { PresignImageResponseDto, UploadImageResponseDto } from './responses';
import { UploadService } from './upload.service';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Get('presign')
  @Serialize(PresignImageResponseDto)
  @ApiOperation({ summary: 'Lấy presigned PUT URL để upload ảnh trực tiếp lên S3' })
  @ApiSuccessResponse(PresignImageResponseDto, 'Presigned URL generated successfully')
  getPresignedUploadUrl(@Query() dto: PresignImageDto): Promise<PresignImageResponseDto> {
    return this.uploadService.getPresignedUploadUrl(dto.type);
  }

  @Post('image')
  @Serialize(UploadImageResponseDto)
  @ApiOperation({ summary: 'Upload an image to S3' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'folder'],
      properties: {
        file: { type: 'string', format: 'binary' },
        folder: { type: 'string', enum: Object.values(UploadFolder) },
      },
    },
  })
  @ApiSuccessResponse(UploadImageResponseDto, 'Image uploaded successfully')
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadImageDto,
  ): Promise<UploadImageResponseDto> {
    return this.uploadService.uploadImage(file, dto.type);
  }
}
