import { FastifyInstance } from 'fastify';
import { ProductionController } from './production.controller';
import { ProductionService } from './production.service';
import { ProductionRepository } from './production.repository';
import { verifyToken, requirePermissions } from '../../middleware/auth';

export async function productionRoutes(fastify: FastifyInstance) {
  const repo = new ProductionRepository(fastify.prisma);
  const service = new ProductionService(repo);
  const controller = new ProductionController(service);

  fastify.addHook('preValidation', verifyToken);

  fastify.get('/', { preHandler: [requirePermissions(['production:read'])] }, (req, res) => controller.list(req, res));
  fastify.get<{ Params: { id: string } }>('/:id', { preHandler: [requirePermissions(['production:read'])] }, (req, res) => controller.get(req, res));
  fastify.post('/', { preHandler: [requirePermissions(['production:write'])] }, (req, res) => controller.create(req, res));
  fastify.put<{ Params: { id: string } }>('/:id', { preHandler: [requirePermissions(['production:write'])] }, (req, res) => controller.update(req, res));
  fastify.delete<{ Params: { id: string } }>('/:id', { preHandler: [requirePermissions(['production:delete'])] }, (req, res) => controller.delete(req, res));
  
  // Approvals
  fastify.post('/bulk-approve', { preHandler: [requirePermissions(['production:approve'])] }, (req, res) => controller.bulkApprove(req, res));
  fastify.post<{ Params: { id: string } }>('/:id/approve', { preHandler: [requirePermissions(['production:approve'])] }, (req, res) => controller.approve(req, res));
  fastify.post<{ Params: { id: string } }>('/:id/reject', { preHandler: [requirePermissions(['production:approve'])] }, (req, res) => controller.reject(req, res));
}
