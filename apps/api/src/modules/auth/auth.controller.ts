import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from './auth.service';
import { loginSchema, refreshTokenSchema, LoginInput, RefreshTokenInput } from '@frms/shared';
import { successResponse } from '../../utils/response';

export class AuthController {
  constructor(private service: AuthService) {}

  async login(request: FastifyRequest, reply: FastifyReply) {
    const input = loginSchema.parse(request.body) as LoginInput;
    const result = await this.service.login(input);
    return reply.send(successResponse('Login successful', result));
  }

  async refreshToken(request: FastifyRequest, reply: FastifyReply) {
    const input = refreshTokenSchema.parse(request.body) as RefreshTokenInput;
    const result = await this.service.refreshToken(input.refreshToken);
    return reply.send(successResponse('Token refreshed', result));
  }

  async logout(request: FastifyRequest, reply: FastifyReply) {
    const { refreshToken } = request.body as any; // Should probably validate this
    // If request.user is set (authenticated logout)
    const userId = request.user?.id;
    await this.service.logout(refreshToken, userId);
    return reply.send(successResponse('Logged out successfully'));
  }
}
