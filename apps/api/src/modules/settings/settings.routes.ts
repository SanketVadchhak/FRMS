import { FastifyInstance } from 'fastify';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { SettingsRepository } from './settings.repository';
import { verifyToken, requirePermissions } from '../../middleware/auth';

export async function settingsRoutes(fastify: FastifyInstance) {
  const repo = new SettingsRepository(fastify.prisma);
  const service = new SettingsService(repo);
  const controller = new SettingsController(service);

  fastify.addHook('preValidation', verifyToken);

  fastify.get('/', { preHandler: [requirePermissions(['settings:read'])] }, (req, res) => controller.get(req, res));
  fastify.put('/', { preHandler: [requirePermissions(['settings:write'])] }, (req, res) => controller.update(req, res));
}
