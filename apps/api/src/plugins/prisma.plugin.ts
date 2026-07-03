import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import { PrismaClient } from '@prisma/client';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

const prismaPlugin: FastifyPluginAsync = async (fastify) => {
  const prisma = new PrismaClient({
    log: ['error', 'warn'],
  });

  // Do NOT call prisma.$connect() here.
  // Prisma auto-connects on the first query, which is much better for
  // serverless cold starts — avoids a blocking SSL handshake to Neon
  // before any request is processed.

  fastify.decorate('prisma', prisma);

  fastify.addHook('onClose', async (server) => {
    await server.prisma.$disconnect();
  });
};

export default fp(prismaPlugin, { name: 'prisma' });
