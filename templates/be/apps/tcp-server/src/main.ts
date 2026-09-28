import * as http from 'node:http';
import { NestFactory } from '@nestjs/core';
import { TcpServerModule } from './tcp-server.module';

async function bootstrap() {
  // createApplicationContext thay vì create() — không khởi động HTTP server.
  // TCP servers được start trong TcpIngestionService.onApplicationBootstrap().
  const app = await NestFactory.createApplicationContext(TcpServerModule);

  app.enableShutdownHooks();

  // HTTP server riêng cho health check — không dùng NestJS HTTP.
  // Docker / load balancer ping GET /health để kiểm tra container còn sống.
  const healthPort = Number(process.env.HEALTH_HTTP_PORT ?? 8080);
  http
    .createServer((req, res) => {
      if (req.url === '/health' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok' }));
      } else {
        res.writeHead(404);
        res.end();
      }
    })
    .listen(healthPort, '0.0.0.0');
}

bootstrap();
