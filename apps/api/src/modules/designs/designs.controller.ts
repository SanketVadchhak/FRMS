import { FastifyRequest, FastifyReply } from 'fastify';
import { DesignsService } from './designs.service';
import { createDesignSchema, updateDesignSchema, DesignCreateInput, DesignUpdateInput } from '@frms/shared';
import { successResponse } from '../../utils/response';

export class DesignsController {
  constructor(private service: DesignsService) {}

  async list(request: FastifyRequest, reply: FastifyReply) {
    const { companyId } = request.user;
    const designs = await this.service.listDesigns(companyId);
    return reply.send(successResponse('Designs retrieved successfully', designs));
  }

  async get(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { companyId } = request.user;
    const { id } = request.params;
    const design = await this.service.getDesign(companyId, id);
    return reply.send(successResponse('Design retrieved successfully', design));
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const { companyId, username } = request.user;
    const input = createDesignSchema.parse(request.body) as DesignCreateInput;
    const design = await this.service.createDesign(companyId, input, username);
    return reply.status(201).send(successResponse('Design created successfully', design));
  }

  async update(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { companyId, username } = request.user;
    const { id } = request.params;
    const input = updateDesignSchema.parse(request.body) as DesignUpdateInput;
    const design = await this.service.updateDesign(companyId, id, input, username);
    return reply.send(successResponse('Design updated successfully', design));
  }

  async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { companyId, username } = request.user;
    const { id } = request.params;
    await this.service.deleteDesign(companyId, id, username);
    return reply.send(successResponse('Design deleted successfully'));
  }
}
