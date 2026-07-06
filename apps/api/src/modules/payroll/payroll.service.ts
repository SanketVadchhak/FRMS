import { PayrollRepository } from './payroll.repository';
import { PayrollEntry } from '@frms/shared';
import { NotFoundError } from '../../utils/errors';

export class PayrollService {
  constructor(private repo: PayrollRepository) {}

  async listPayrolls(companyId: string) {
    return this.repo.findAllByCompany(companyId);
  }

  async getPayroll(companyId: string, id: string) {
    const payroll = await this.repo.findById(companyId, id);
    if (!payroll) {
      throw new NotFoundError('Payroll');
    }
    return payroll;
  }

  async generatePayroll(companyId: string, data: PayrollEntry, createdBy: string) {
    // For now we assume the frontend calculates these and there are no specific advance IDs provided
    // In a fully integrated backend, we'd look up advance IDs based on periodEnd
    return this.repo.generatePayroll(companyId, data, createdBy, []);
  }

  async generateBatch(companyId: string, data: PayrollEntry[], createdBy: string) {
    return this.repo.generateBatch(companyId, data, createdBy);
  }

  async markAsPaid(companyId: string, id: string, paymentMethod: string, updatedBy: string) {
    const payroll = await this.repo.findById(companyId, id);
    if (!payroll) {
      throw new NotFoundError('Payroll');
    }
    await this.repo.markAsPaid(companyId, id, paymentMethod, updatedBy);
  }
}
