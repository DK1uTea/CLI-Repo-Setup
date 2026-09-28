import { NestFactory } from '@nestjs/core';
import * as http from 'http';
import { WorkerModule } from './worker.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(WorkerModule);

  app.enableShutdownHooks();
  console.log(`Worker is running and listening for queue jobs`);

  // Minimal HTTP health server for ECS health checks
  const port = parseInt(process.env.HEALTH_PORT ?? '3001', 10);
  http
    .createServer((_req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok' }));
    })
    .listen(port, () => {
      console.log(`Worker health check listening on port ${port}`);
    });
}

bootstrap().catch((err) => {
  console.error('Worker bootstrap failed:', err);
  process.exit(1);
});
