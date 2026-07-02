import { FastifyRequest, FastifyReply } from 'fastify';
import { EmployeesService } from './employees.service';
import { createEmployeeSchema, updateEmployeeSchema, EmployeeCreateInput, EmployeeUpdateInput } from '@frms/shared';
import { successResponse } from '../../utils/response';

export class EmployeesController {
  constructor(private service: EmployeesService) {}

  async list(request: FastifyRequest, reply: FastifyReply) {
    const { companyId } = request.user;
    const employees = await this.service.listEmployees(companyId);
    return reply.send(successResponse('Employees retrieved successfully', employees));
  }

  async get(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { companyId } = request.user;
    const { id } = request.params;
    const employee = await this.service.getEmployee(companyId, id);
    return reply.send(successResponse('Employee retrieved successfully', employee));
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const { companyId, username } = request.user;
    const input = createEmployeeSchema.parse(request.body) as EmployeeCreateInput;
    const employee = await this.service.createEmployee(companyId, input, username);
    return reply.status(201).send(successResponse('Employee created successfully', employee));
  }

  async update(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { companyId, username } = request.user;
    const { id } = request.params;
    const input = updateEmployeeSchema.parse(request.body) as EmployeeUpdateInput;
    const employee = await this.service.updateEmployee(companyId, id, input, username);
    return reply.send(successResponse('Employee updated successfully', employee));
  }

  async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { companyId, username } = request.user;
    const { id } = request.params;
    await this.service.deleteEmployee(companyId, id, username);
    return reply.send(successResponse('Employee deleted successfully'));
  }
}
