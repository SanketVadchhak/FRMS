import { FastifyRequest, FastifyReply } from 'fastify';
import { AuditLogService } from './auditlog.service';
import { successResponse } from '../../utils/response';

export class AuditLogController {
  constructor(private service: AuditLogService) {}

  async list(request: FastifyRequest, reply: FastifyReply) {
    const { companyId } = request.user;
    const logs = await this.service.list(companyId);
    return reply.send(successResponse('Audit logs retrieved', logs));
  }
}
