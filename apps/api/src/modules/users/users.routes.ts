import { FastifyInstance } from 'fastify';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { verifyToken, requirePermissions } from '../../middleware/auth';

export async function usersRoutes(fastify: FastifyInstance) {
  const repo = new UsersRepository(fastify.prisma);
  const service = new UsersService(repo);
  const controller = new UsersController(service);

  // All user routes require authentication and specific permissions
  fastify.addHook('preValidation', verifyToken);

  fastify.get('/', { preHandler: [requirePermissions(['users:read'])] }, (req, res) => controller.listUsers(req, res));
  fastify.post('/', { preHandler: [requirePermissions(['users:write'])] }, (req, res) => controller.createUser(req, res));
  fastify.delete<{ Params: { id: string } }>('/:id', { preHandler: [requirePermissions(['users:delete'])] }, (req, res) => controller.deleteUser(req, res));
}
