import type { CompanySettings } from '@frms/shared';

const LOCAL_STORAGE_KEY = 'frms_company_settings_mock';

const defaultSettings: CompanySettings = {
  name: 'FRMS Embroidery Inc.',
  address: '123 Textile Avenue, Industrial Area',
  phone: '123-456-7890',
  email: 'contact@frms-embroidery.com',
  gstNumber: 'GSTIN123456789',
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const SettingsMockService = {
  getCompanySettings: async (): Promise<CompanySettings> => {
    await delay(500); // Simulate network latency
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored) as CompanySettings;
      } catch (e) {
        console.error('Failed to parse mock settings from localStorage', e);
      }
    }
    // Initialize with default settings if none exist
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultSettings));
    return defaultSettings;
  },

  updateCompanySettings: async (settings: CompanySettings): Promise<CompanySettings> => {
    await delay(500); // Simulate network latency
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
    return settings;
  },
};
