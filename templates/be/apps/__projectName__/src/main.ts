import { getAppConfig, setupSwagger } from '@app/core';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const { apiPort, corsOrigins } = getAppConfig();
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });
  app
    .useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    )
    .setGlobalPrefix('api', { exclude: ['/health'] });
  // Health check endpoint — outside /api prefix so NLB + container HEALTHCHECK can reach it
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });
  setupSwagger(app);
  await app.listen(apiPort);
  console.log(`{{projectNameTitle}} API is running on port: ${apiPort}`);
}
bootstrap();
