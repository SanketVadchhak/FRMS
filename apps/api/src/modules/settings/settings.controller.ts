import { FastifyRequest, FastifyReply } from 'fastify';
import { SettingsService } from './settings.service';
import { successResponse } from '../../utils/response';

export class SettingsController {
  constructor(private service: SettingsService) {}

  async get(request: FastifyRequest, reply: FastifyReply) {
    const { companyId } = request.user;
    const settings = await this.service.getSettings(companyId);
    return reply.send(successResponse('Settings retrieved', settings));
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { companyId, username } = request.user;
    const data = request.body;
    const settings = await this.service.updateSettings(companyId, data, username);
    return reply.send(successResponse('Settings updated', settings));
  }
}
