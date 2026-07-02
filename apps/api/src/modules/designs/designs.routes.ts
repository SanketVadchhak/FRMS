import { FastifyInstance } from 'fastify';
import { DesignsController } from './designs.controller';
import { DesignsService } from './designs.service';
import { DesignsRepository } from './designs.repository';
import { verifyToken, requirePermissions } from '../../middleware/auth';

export async function designsRoutes(fastify: FastifyInstance) {
  const repo = new DesignsRepository(fastify.prisma);
  const service = new DesignsService(repo);
  const controller = new DesignsController(service);

  fastify.addHook('preValidation', verifyToken);

  fastify.get('/', { preHandler: [requirePermissions(['designs:read'])] }, (req, res) => controller.list(req, res));
  fastify.get<{ Params: { id: string } }>('/:id', { preHandler: [requirePermissions(['designs:read'])] }, (req, res) => controller.get(req, res));
  fastify.post('/', { preHandler: [requirePermissions(['designs:write'])] }, (req, res) => controller.create(req, res));
  fastify.put<{ Params: { id: string } }>('/:id', { preHandler: [requirePermissions(['designs:write'])] }, (req, res) => controller.update(req, res));
  fastify.delete<{ Params: { id: string } }>('/:id', { preHandler: [requirePermissions(['designs:delete'])] }, (req, res) => controller.delete(req, res));
}
