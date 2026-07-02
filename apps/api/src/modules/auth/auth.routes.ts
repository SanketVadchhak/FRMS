import { FastifyInstance } from 'fastify';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { verifyToken } from '../../middleware/auth';

export async function authRoutes(fastify: FastifyInstance) {
  const repo = new AuthRepository(fastify.prisma);
  const service = new AuthService(repo, fastify);
  const controller = new AuthController(service);

  fastify.post('/login', controller.login.bind(controller));
  fastify.post('/refresh', controller.refreshToken.bind(controller));
  
  // Logout can be called with or without an active session (just need the refresh token)
  // but if we want to extract user, we can optionally authenticate
  fastify.post('/logout', controller.logout.bind(controller));
  
  // Example of a protected route
  fastify.get('/me', { preValidation: [verifyToken] }, async (request, reply) => {
    return reply.send({ success: true, data: request.user });
  });
}
