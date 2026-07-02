import { FastifyRequest, FastifyReply } from 'fastify';
import { ProductionService } from './production.service';
import { productionEntrySchema, ProductionEntry } from '@frms/shared';
import { successResponse } from '../../utils/response';
import { z } from 'zod';

export class ProductionController {
  constructor(private service: ProductionService) {}

  async list(request: FastifyRequest, reply: FastifyReply) {
    const { companyId } = request.user;
    const entries = await this.service.listEntries(companyId);
    return reply.send(successResponse('Production entries retrieved', entries));
  }

  async get(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { companyId } = request.user;
    const { id } = request.params;
    const entry = await this.service.getEntry(companyId, id);
    return reply.send(successResponse('Production entry retrieved', entry));
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const { companyId, username } = request.user;
    const input = productionEntrySchema.parse(request.body) as ProductionEntry;
    const entry = await this.service.createEntry(companyId, input, username);
    return reply.status(201).send(successResponse('Production entry created', entry));
  }

  async update(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { companyId, username } = request.user;
    const { id } = request.params;
    const input = productionEntrySchema.parse(request.body) as ProductionEntry;
    const entry = await this.service.updateEntry(companyId, id, input, username);
    return reply.send(successResponse('Production entry updated', entry));
  }

  async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { companyId, username } = request.user;
    const { id } = request.params;
    await this.service.deleteEntry(companyId, id, username);
    return reply.send(successResponse('Production entry deleted'));
  }

  async approve(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { companyId, username } = request.user;
    const { id } = request.params;
    await this.service.approveEntry(companyId, id, username);
    return reply.send(successResponse('Production entry approved'));
  }

  async reject(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { companyId, username } = request.user;
    const { id } = request.params;
    const { reason } = z.object({ reason: z.string().min(1) }).parse(request.body);
    await this.service.rejectEntry(companyId, id, reason, username);
    return reply.send(successResponse('Production entry rejected'));
  }
}
