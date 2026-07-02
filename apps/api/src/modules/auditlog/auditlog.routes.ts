import { FastifyInstance } from 'fastify';
import { AuditLogController } from './auditlog.controller';
import { AuditLogService } from './auditlog.service';
import { AuditLogRepository } from './auditlog.repository';
import { verifyToken, requirePermissions } from '../../middleware/auth';

export async function auditlogRoutes(fastify: FastifyInstance) {
  const repo = new AuditLogRepository(fastify.prisma);
  const service = new AuditLogService(repo);
  const controller = new AuditLogController(service);

  fastify.addHook('preValidation', verifyToken);

  fastify.get('/', { preHandler: [requirePermissions(['auditlog:read'])] }, (req, res) => controller.list(req, res));
}
