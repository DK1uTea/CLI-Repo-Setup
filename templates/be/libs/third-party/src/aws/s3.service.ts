import { extname } from 'node:path';
import { awsConfiguration, randomString } from '@app/core';
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Inject, Injectable, Logger } from '@nestjs/common';
import dayjs from 'dayjs';
import { S3_CLIENT, UploadFolder } from './aws.constants';

export interface UploadResult {
  path: string;
  url: string;
}

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly bucket: string;
  private readonly baseUrl: string;

  constructor(
    @Inject(S3_CLIENT) private readonly s3: S3Client,
    @Inject(awsConfiguration.KEY)
    awsConfig: ReturnType<typeof awsConfiguration>,
  ) {
    this.bucket = awsConfig.s3Bucket;
    this.baseUrl = awsConfig.s3BaseUrl;
  }

  async uploadImage(
    file: Buffer,
    options: {
      type?: string;
      originalName?: string;
      contentType?: string;
    } = {},
  ): Promise<UploadResult> {
    const { type = UploadFolder, originalName = '', contentType = 'image/jpeg' } = options;

    const ext = originalName ? extname(originalName) : '.jpg';
    const key = `${type}/${dayjs().format('YYYY-MM-DD')}/${randomString(16)}${ext}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file,
        ContentType: contentType,
      }),
    );

    return { path: key, url: `${this.baseUrl}/${key}` };
  }

  getPresignedUploadUrl(key: string, expiresIn = 900): Promise<string> {
    return getSignedUrl(this.s3, new PutObjectCommand({ Bucket: this.bucket, Key: key }), {
      expiresIn,
    });
  }

  async deleteObject(key: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );

    this.logger.log(`Deleted S3 object: ${key}`);
  }
}
