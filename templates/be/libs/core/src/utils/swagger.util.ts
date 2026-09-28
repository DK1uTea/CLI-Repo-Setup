import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
// import { appConfiguration } from '../configs';
import { SWAGGER_BEARER_TOKEN } from '../constants';
// import { NodeEnv } from '../enums';

export const setupSwagger = (app: INestApplication): void => {
  // comment because dont have staging
  // const appConfig = app.get<ReturnType<typeof appConfiguration>>(appConfiguration.KEY);

  // if (appConfig.nodeEnv === NodeEnv.Prod) {
  //   return;
  // }

  const config = new DocumentBuilder()
    .setTitle('{{projectNameTitle}} API')
    .setDescription('API documentation for {{projectNameTitle}}')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, SWAGGER_BEARER_TOKEN)
    .addSecurityRequirements(SWAGGER_BEARER_TOKEN)
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    ignoreGlobalPrefix: false,
  });
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
};
