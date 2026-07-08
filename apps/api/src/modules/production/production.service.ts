import { ProductionRepository } from './production.repository';
import { ProductionEntry as SharedProductionEntry } from '@frms/shared';
import { NotFoundError } from '../../utils/errors';

export class ProductionService {
  constructor(private repo: ProductionRepository) {}

  async listEntries(companyId: string) {
    return this.repo.findAllByCompany(companyId);
  }

  async getEntry(companyId: string, id: string) {
    const entry = await this.repo.findById(companyId, id);
    if (!entry) {
      throw new NotFoundError('Production Entry');
    }
    return entry;
  }

  async createEntry(companyId: string, data: SharedProductionEntry, createdBy: string) {
    return this.repo.createWithDetails(companyId, data, createdBy);
  }

  async updateEntry(companyId: string, id: string, data: SharedProductionEntry, updatedBy: string) {
    const entry = await this.repo.findById(companyId, id);
    if (!entry) {
      throw new NotFoundError('Production Entry');
    }
    await this.repo.updateWithDetails(companyId, id, data, updatedBy);
    return this.getEntry(companyId, id);
  }

  async deleteEntry(companyId: string, id: string, deletedBy: string) {
    const entry = await this.repo.findById(companyId, id);
    if (!entry) {
      throw new NotFoundError('Production Entry');
    }
    await this.repo.softDelete(companyId, id, deletedBy);
  }

  async approveEntry(companyId: string, id: string, username: string) {
    const entry = await this.repo.findById(companyId, id);
    if (!entry) {
      throw new NotFoundError('Production Entry');
    }
    await this.repo.updateStatus(companyId, id, 'APPROVED', undefined, username);
  }

  async rejectEntry(companyId: string, id: string, reason: string, username: string) {
    const entry = await this.repo.findById(companyId, id);
    if (!entry) {
      throw new NotFoundError('Production Entry');
    }
    await this.repo.updateStatus(companyId, id, 'REJECTED', reason, username);
  }

  async bulkApproveEntries(companyId: string, ids: string[], username: string) {
    if (!ids || ids.length === 0) return;
    await this.repo.bulkUpdateStatus(companyId, ids, 'APPROVED', username);
  }
}
