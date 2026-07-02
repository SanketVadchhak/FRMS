import { apiClient } from '@/lib/apiClient';
import type { CompanySettings } from '@frms/shared';

export interface ISettingsService {
  getCompanySettings(): Promise<CompanySettings>;
  updateCompanySettings(settings: CompanySettings): Promise<CompanySettings>;
}

export const SettingsService: ISettingsService = {
  getCompanySettings: () => apiClient.get<CompanySettings>('/settings'),
  updateCompanySettings: (settings) => apiClient.put<CompanySettings>('/settings', settings),
};
