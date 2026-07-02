import { MachinesRepository } from './machines.repository';
import { MachineCreateInput, MachineUpdateInput } from '@frms/shared';
import { NotFoundError } from '../../utils/errors';

export class MachinesService {
  constructor(private repo: MachinesRepository) {}

  async listMachines(companyId: string) {
    return this.repo.findAllByCompany(companyId);
  }

  async getMachine(companyId: string, id: string) {
    const machine = await this.repo.findById(companyId, id);
    if (!machine) {
      throw new NotFoundError('Machine');
    }
    return machine;
  }

  async createMachine(companyId: string, data: MachineCreateInput, createdBy: string) {
    return this.repo.create(companyId, data, createdBy);
  }

  async updateMachine(companyId: string, id: string, data: MachineUpdateInput, updatedBy: string) {
    const machine = await this.repo.findById(companyId, id);
    if (!machine) {
      throw new NotFoundError('Machine');
    }
    await this.repo.update(companyId, id, data, updatedBy);
    return this.getMachine(companyId, id);
  }

  async deleteMachine(companyId: string, id: string, deletedBy: string) {
    const machine = await this.repo.findById(companyId, id);
    if (!machine) {
      throw new NotFoundError('Machine');
    }
    await this.repo.softDelete(companyId, id, deletedBy);
  }
}
