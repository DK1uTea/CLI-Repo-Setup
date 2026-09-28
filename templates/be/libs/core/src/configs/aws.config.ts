import { registerAs } from '@nestjs/config';
import Joi from 'joi';

export const awsSchema = {
  AWS_REGION: Joi.string().default('ap-southeast-1'),
  AWS_ACCESS_KEY_ID: Joi.string().required(),
  AWS_SECRET_ACCESS_KEY: Joi.string().required(),
  AWS_S3_BUCKET: Joi.string().required(),
  AWS_S3_BASE_URL: Joi.string().uri().optional(),
};

export interface IAwsConfig {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  s3Bucket: string;
  s3BaseUrl: string;
}

export const awsConfiguration = registerAs(
  'aws',
  (): IAwsConfig => ({
    region: process.env.AWS_REGION ?? 'ap-southeast-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
    s3Bucket: process.env.AWS_S3_BUCKET ?? '',
    s3BaseUrl:
      process.env.AWS_S3_BASE_URL ??
      `https://${process.env.AWS_S3_BUCKET ?? ''}.s3.${process.env.AWS_REGION ?? 'ap-southeast-1'}.amazonaws.com`,
  }),
);
