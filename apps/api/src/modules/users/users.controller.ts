import { FastifyRequest, FastifyReply } from 'fastify';
import { UsersService } from './users.service';
import { userCreateSchema, UserCreateInput } from '@frms/shared';
import { successResponse } from '../../utils/response';

export class UsersController {
  constructor(private service: UsersService) {}

  async listUsers(request: FastifyRequest, reply: FastifyReply) {
    const { companyId } = request.user;
    const users = await this.service.listUsers(companyId);
    return reply.send(successResponse('Users retrieved successfully', users));
  }

  async createUser(request: FastifyRequest, reply: FastifyReply) {
    const { companyId, id: createdBy } = request.user;
    const input = userCreateSchema.parse(request.body) as UserCreateInput;
    
    const result = await this.service.createUser(companyId, input, createdBy);
    return reply.status(201).send(successResponse('User created successfully', result));
  }

  async deleteUser(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { companyId, username } = request.user;
    const { id } = request.params;

    await this.service.softDeleteUser(companyId, id, username);
    return reply.send(successResponse('User deleted successfully'));
  }
}
