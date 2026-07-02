import { SettingsRepository } from './settings.repository';

export class SettingsService {
  constructor(private repo: SettingsRepository) {}

  async getSettings(companyId: string) {
    const settings = await this.repo.getSettings(companyId);
    return settings || {};
  }

  async updateSettings(companyId: string, data: any, updatedBy: string) {
    return this.repo.upsertSettings(companyId, data, updatedBy);
  }
}
