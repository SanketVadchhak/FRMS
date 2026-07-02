import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
import { env } from './config/env';
import prismaPlugin from './plugins/prisma.plugin';
import { AppError } from './utils/errors';
import { errorResponse } from './utils/response';
import { ZodError } from 'zod';
import { authRoutes } from './modules/auth/auth.routes';
import { usersRoutes } from './modules/users/users.routes';
import { employeesRoutes } from './modules/employees/employees.routes';
import { machinesRoutes } from './modules/machines/machines.routes';
import { designsRoutes } from './modules/designs/designs.routes';
import { productionRoutes } from './modules/production/production.routes';
import { payrollRoutes } from './modules/payroll/payroll.routes';
import { settingsRoutes } from './modules/settings/settings.routes';
import { auditlogRoutes } from './modules/auditlog/auditlog.routes';

const fastify = Fastify({
  logger: {
    level: env.LOG_LEVEL,
    transport: env.NODE_ENV === 'development' ? { target: 'pino-pretty' } : undefined,
  },
});

// Global Error Handler
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);

  if (error instanceof AppError) {
    return reply.status(error.statusCode).send(errorResponse(error.message, error.code, error.details));
  }

  if (error instanceof ZodError) {
    return reply.status(400).send(errorResponse('Validation Error', 'VALIDATION_ERROR', error.errors));
  }

  // Fastify rate limit error
  if (error.statusCode === 429) {
    return reply.status(429).send(errorResponse('Too many requests', 'RATE_LIMIT_EXCEEDED'));
  }

  return reply.status(500).send(errorResponse('Internal Server Error', 'INTERNAL_SERVER_ERROR'));
});

async function registerPlugins() {
  try {
    // Register Plugins
    await fastify.register(cors, {
      origin: env.CORS_ORIGIN.split(','),
      credentials: true,
    });

    await fastify.register(rateLimit, {
      max: env.RATE_LIMIT_MAX,
      timeWindow: env.RATE_LIMIT_WINDOW_MS,
    });

    await fastify.register(jwt, {
      secret: env.JWT_ACCESS_SECRET,
    });

    await fastify.register(prismaPlugin);

    // Routes
    await fastify.register(authRoutes, { prefix: '/api/v1/auth' });
    await fastify.register(usersRoutes, { prefix: '/api/v1/users' });
    await fastify.register(employeesRoutes, { prefix: '/api/v1/employees' });
    await fastify.register(machinesRoutes, { prefix: '/api/v1/machines' });
    await fastify.register(designsRoutes, { prefix: '/api/v1/designs' });
    await fastify.register(productionRoutes, { prefix: '/api/v1/production' });
    await fastify.register(payrollRoutes, { prefix: '/api/v1/payroll' });
    await fastify.register(settingsRoutes, { prefix: '/api/v1/settings' });
    await fastify.register(auditlogRoutes, { prefix: '/api/v1/auditlog' });

    // Health Check
    fastify.get('/api/health', async () => {
      return { status: 'ok', timestamp: new Date().toISOString() };
    });
}

// Register plugins globally so they are ready for serverless
registerPlugins().catch(err => {
  fastify.log.error(err);
  process.exit(1);
});

async function start() {
  try {
    // Start Server
    await fastify.listen({ port: env.PORT, host: env.HOST });
    
    fastify.log.info(`Server listening on http://${env.HOST}:${env.PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

export const app = fastify;

if (!process.env.VERCEL) {
  start();
}

// Handle Graceful Shutdown
['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, async () => {
    fastify.log.info(`Received ${signal}, initiating graceful shutdown...`);
    await fastify.close();
    process.exit(0);
  });
});

