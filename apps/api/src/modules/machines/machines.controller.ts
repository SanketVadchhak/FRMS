import { FastifyRequest, FastifyReply } from 'fastify';
import { MachinesService } from './machines.service';
import { createMachineSchema, updateMachineSchema, MachineCreateInput, MachineUpdateInput } from '@frms/shared';
import { successResponse } from '../../utils/response';

export class MachinesController {
  constructor(private service: MachinesService) {}

  async list(request: FastifyRequest, reply: FastifyReply) {
    const { companyId } = request.user;
    const machines = await this.service.listMachines(companyId);
    return reply.send(successResponse('Machines retrieved successfully', machines));
  }

  async get(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { companyId } = request.user;
    const { id } = request.params;
    const machine = await this.service.getMachine(companyId, id);
    return reply.send(successResponse('Machine retrieved successfully', machine));
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const { companyId, username } = request.user;
    const input = createMachineSchema.parse(request.body) as MachineCreateInput;
    const machine = await this.service.createMachine(companyId, input, username);
    return reply.status(201).send(successResponse('Machine created successfully', machine));
  }

  async update(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { companyId, username } = request.user;
    const { id } = request.params;
    const input = updateMachineSchema.parse(request.body) as MachineUpdateInput;
    const machine = await this.service.updateMachine(companyId, id, input, username);
    return reply.send(successResponse('Machine updated successfully', machine));
  }

  async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { companyId, username } = request.user;
    const { id } = request.params;
    await this.service.deleteMachine(companyId, id, username);
    return reply.send(successResponse('Machine deleted successfully'));
  }
}
