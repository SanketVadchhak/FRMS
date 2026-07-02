import { FastifyInstance } from 'fastify';
import { MachinesController } from './machines.controller';
import { MachinesService } from './machines.service';
import { MachinesRepository } from './machines.repository';
import { verifyToken, requirePermissions } from '../../middleware/auth';

export async function machinesRoutes(fastify: FastifyInstance) {
  const repo = new MachinesRepository(fastify.prisma);
  const service = new MachinesService(repo);
  const controller = new MachinesController(service);

  fastify.addHook('preValidation', verifyToken);

  fastify.get('/', { preHandler: [requirePermissions(['machines:read'])] }, (req, res) => controller.list(req, res));
  fastify.get<{ Params: { id: string } }>('/:id', { preHandler: [requirePermissions(['machines:read'])] }, (req, res) => controller.get(req, res));
  fastify.post('/', { preHandler: [requirePermissions(['machines:write'])] }, (req, res) => controller.create(req, res));
  fastify.put<{ Params: { id: string } }>('/:id', { preHandler: [requirePermissions(['machines:write'])] }, (req, res) => controller.update(req, res));
  fastify.delete<{ Params: { id: string } }>('/:id', { preHandler: [requirePermissions(['machines:delete'])] }, (req, res) => controller.delete(req, res));
}
