import type { CompanySettings } from '@frms/shared';
import { SettingsMockService } from './settings.mock';

export interface ISettingsService {
  getCompanySettings(): Promise<CompanySettings>;
  updateCompanySettings(settings: CompanySettings): Promise<CompanySettings>;
}

// In the future, this can be swapped with a real API service
export const SettingsService: ISettingsService = {
  getCompanySettings: () => SettingsMockService.getCompanySettings(),
  updateCompanySettings: (settings) => SettingsMockService.updateCompanySettings(settings),
};
