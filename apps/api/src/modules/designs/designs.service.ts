import { DesignsRepository } from './designs.repository';
import { DesignCreateInput, DesignUpdateInput } from '@frms/shared';
import { NotFoundError } from '../../utils/errors';

export class DesignsService {
  constructor(private repo: DesignsRepository) {}

  async listDesigns(companyId: string) {
    return this.repo.findAllByCompany(companyId);
  }

  async getDesign(companyId: string, id: string) {
    const design = await this.repo.findById(companyId, id);
    if (!design) {
      throw new NotFoundError('Design');
    }
    return design;
  }

  async createDesign(companyId: string, data: DesignCreateInput, createdBy: string) {
    return this.repo.create(companyId, data, createdBy);
  }

  async updateDesign(companyId: string, id: string, data: DesignUpdateInput, updatedBy: string) {
    const design = await this.repo.findById(companyId, id);
    if (!design) {
      throw new NotFoundError('Design');
    }
    await this.repo.update(companyId, id, data, updatedBy);
    return this.getDesign(companyId, id);
  }

  async deleteDesign(companyId: string, id: string, deletedBy: string) {
    const design = await this.repo.findById(companyId, id);
    if (!design) {
      throw new NotFoundError('Design');
    }
    await this.repo.softDelete(companyId, id, deletedBy);
  }
}
