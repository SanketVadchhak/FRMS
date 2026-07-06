import { FastifyInstance } from 'fastify';
import { PayrollController } from './payroll.controller';
import { PayrollService } from './payroll.service';
import { PayrollRepository } from './payroll.repository';
import { verifyToken, requirePermissions } from '../../middleware/auth';

export async function payrollRoutes(fastify: FastifyInstance) {
  const repo = new PayrollRepository(fastify.prisma);
  const service = new PayrollService(repo);
  const controller = new PayrollController(service);

  fastify.addHook('preValidation', verifyToken);

  fastify.get('/', { preHandler: [requirePermissions(['payroll:read'])] }, (req, res) => controller.list(req, res));
  fastify.get<{ Params: { id: string } }>('/:id', { preHandler: [requirePermissions(['payroll:read'])] }, (req, res) => controller.get(req, res));
  fastify.post('/generate', { preHandler: [requirePermissions(['payroll:write'])] }, (req, res) => controller.generate(req, res));
  fastify.post('/batch', { preHandler: [requirePermissions(['payroll:write'])] }, (req, res) => controller.generateBatch(req, res));
  fastify.get('/payments', { preHandler: [requirePermissions(['payroll:read'])] }, (req, res) => {
    // Return empty array for now to resolve 404 until full payment module is built
    return res.send({ success: true, message: 'Payments retrieved', data: [] });
  });
  fastify.post<{ Params: { id: string } }>('/:id/pay', { preHandler: [requirePermissions(['payroll:write'])] }, (req, res) => controller.markAsPaid(req, res));
}
