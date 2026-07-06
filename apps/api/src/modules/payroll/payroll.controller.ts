import { FastifyRequest, FastifyReply } from 'fastify';
import { PayrollService } from './payroll.service';
import { payrollSchema, PayrollEntry } from '@frms/shared';
import { successResponse } from '../../utils/response';
import { z } from 'zod';

export class PayrollController {
  constructor(private service: PayrollService) {}

  async list(request: FastifyRequest, reply: FastifyReply) {
    const { companyId } = request.user;
    const payrolls = await this.service.listPayrolls(companyId);
    return reply.send(successResponse('Payrolls retrieved successfully', payrolls));
  }

  async get(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { companyId } = request.user;
    const { id } = request.params;
    const payroll = await this.service.getPayroll(companyId, id);
    return reply.send(successResponse('Payroll retrieved successfully', payroll));
  }

  async generate(request: FastifyRequest, reply: FastifyReply) {
    const { companyId, username } = request.user;
    const input = payrollSchema.parse(request.body) as PayrollEntry;
    const payroll = await this.service.generatePayroll(companyId, input, username);
    return reply.status(201).send(successResponse('Payroll generated successfully', payroll));
  }

  async generateBatch(request: FastifyRequest, reply: FastifyReply) {
    const { companyId, username } = request.user;
    const input = z.array(payrollSchema).parse(request.body) as PayrollEntry[];
    const count = await this.service.generateBatch(companyId, input, username);
    return reply.status(201).send(successResponse('Batch payroll generated successfully', { count }));
  }

  async markAsPaid(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { companyId, username } = request.user;
    const { id } = request.params;
    const { paymentMethod } = z.object({ paymentMethod: z.string().default('BANK_TRANSFER') }).parse(request.body);
    await this.service.markAsPaid(companyId, id, paymentMethod, username);
    return reply.send(successResponse('Payroll marked as paid'));
  }
}
