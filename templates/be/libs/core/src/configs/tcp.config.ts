import { registerAs } from '@nestjs/config';
import Joi from 'joi';

export const tcpSchema = {
  TCP_PORT_1: Joi.number().default(5023),
  TCP_PORT_2: Joi.number().default(9942),
  HEALTH_HTTP_PORT: Joi.number().default(8080),
};

export interface ITcpConfig {
  tcpPort1: number;
  tcpPort2: number;
  healthHttpPort: number;
}

export const getTcpConfig = (): ITcpConfig => ({
  tcpPort1: Number(process.env.TCP_PORT_1 ?? 5023),
  tcpPort2: Number(process.env.TCP_PORT_2 ?? 9942),
  healthHttpPort: Number(process.env.HEALTH_HTTP_PORT ?? 8080),
});

export const tcpConfiguration = registerAs('tcp', getTcpConfig);
