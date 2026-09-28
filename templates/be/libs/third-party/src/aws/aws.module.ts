import { awsConfiguration } from '@app/core';
import { S3Client } from '@aws-sdk/client-s3';
import { Global, Logger, Module } from '@nestjs/common';
import { S3_CLIENT } from './aws.constants';
import { S3Service } from './s3.service';

@Global()
@Module({
  providers: [
    {
      provide: S3_CLIENT,
      inject: [awsConfiguration.KEY],
      useFactory: (awsConfig: ReturnType<typeof awsConfiguration>): S3Client => {
        const logger = new Logger('S3Client');

        const client = new S3Client({
          region: awsConfig.region,
          credentials: {
            accessKeyId: awsConfig.accessKeyId,
            secretAccessKey: awsConfig.secretAccessKey,
          },
        });

        logger.log(
          `S3Client initialized (region: ${awsConfig.region}, bucket: ${awsConfig.s3Bucket})`,
        );

        return client;
      },
    },
    S3Service,
  ],
  exports: [S3Service],
})
export class AwsModule {}
