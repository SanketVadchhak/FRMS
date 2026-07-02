import { EmployeesRepository } from './employees.repository';
import { EmployeeCreateInput, EmployeeUpdateInput } from '@frms/shared';
import { NotFoundError } from '../../utils/errors';

export class EmployeesService {
  constructor(private repo: EmployeesRepository) {}

  async listEmployees(companyId: string) {
    return this.repo.findAllByCompany(companyId);
  }

  async getEmployee(companyId: string, id: string) {
    const employee = await this.repo.findById(companyId, id);
    if (!employee) {
      throw new NotFoundError('Employee');
    }
    return employee;
  }

  async createEmployee(companyId: string, data: EmployeeCreateInput, createdBy: string) {
    return this.repo.create(companyId, data, createdBy);
  }

  async updateEmployee(companyId: string, id: string, data: EmployeeUpdateInput, updatedBy: string) {
    const employee = await this.repo.findById(companyId, id);
    if (!employee) {
      throw new NotFoundError('Employee');
    }
    await this.repo.update(companyId, id, data, updatedBy);
    return this.getEmployee(companyId, id);
  }

  async deleteEmployee(companyId: string, id: string, deletedBy: string) {
    const employee = await this.repo.findById(companyId, id);
    if (!employee) {
      throw new NotFoundError('Employee');
    }
    await this.repo.softDelete(companyId, id, deletedBy);
  }
}
