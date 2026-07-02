import { FastifyInstance } from 'fastify';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { EmployeesRepository } from './employees.repository';
import { verifyToken, requirePermissions } from '../../middleware/auth';

export async function employeesRoutes(fastify: FastifyInstance) {
  const repo = new EmployeesRepository(fastify.prisma);
  const service = new EmployeesService(repo);
  const controller = new EmployeesController(service);

  fastify.addHook('preValidation', verifyToken);

  fastify.get('/', { preHandler: [requirePermissions(['employees:read'])] }, (req, res) => controller.list(req, res));
  fastify.get<{ Params: { id: string } }>('/:id', { preHandler: [requirePermissions(['employees:read'])] }, (req, res) => controller.get(req, res));
  fastify.post('/', { preHandler: [requirePermissions(['employees:write'])] }, (req, res) => controller.create(req, res));
  fastify.put<{ Params: { id: string } }>('/:id', { preHandler: [requirePermissions(['employees:write'])] }, (req, res) => controller.update(req, res));
  fastify.delete<{ Params: { id: string } }>('/:id', { preHandler: [requirePermissions(['employees:delete'])] }, (req, res) => controller.delete(req, res));
}
