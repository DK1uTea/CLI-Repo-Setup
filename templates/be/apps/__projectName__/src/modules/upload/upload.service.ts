import { Api400HttpError, randomString } from '@app/core';
import { S3Service, UploadFolder } from '@app/third-party';
import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import { UPLOAD_ERROR_CODES } from './constants';
import { PresignImageResponseDto, UploadImageResponseDto } from './responses';

const PRESIGN_EXPIRES_IN = 300; // 5 phút

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

@Injectable()
export class UploadService {
  constructor(private readonly s3Service: S3Service) {}

  uploadImage(file: Express.Multer.File, type: UploadFolder): Promise<UploadImageResponseDto> {
    if (!file) throw new Api400HttpError(UPLOAD_ERROR_CODES.NO_FILE);

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new Api400HttpError(UPLOAD_ERROR_CODES.INVALID_MIME_TYPE);
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new Api400HttpError(UPLOAD_ERROR_CODES.FILE_TOO_LARGE);
    }

    return this.s3Service.uploadImage(file.buffer, {
      type,
      originalName: file.originalname,
      contentType: file.mimetype,
    });
  }

  async getPresignedUploadUrl(folder: UploadFolder): Promise<PresignImageResponseDto> {
    const key = `${folder}/${dayjs().format('YYYY-MM-DD')}/${randomString(16)}.jpg`;
    const url = await this.s3Service.getPresignedUploadUrl(key, PRESIGN_EXPIRES_IN);
    return { key, url };
  }
}
