import type { Design } from '@frms/shared';
import { DesignStatus } from '@frms/shared';

const STORAGE_KEY = 'frms_designs';

const MOCK_DESIGNS: Design[] = [
  { id: 'd1', code: 'D-1001', name: 'Floral Pattern A', status: DesignStatus.ACTIVE },
  { id: 'd2', code: 'D-1002', name: 'Geometric Border', status: DesignStatus.ACTIVE },
  { id: 'd3', code: 'D-1003', name: 'Custom Logo X', status: DesignStatus.INACTIVE },
];

export const mockDesignService = {
  getDesigns: async (): Promise<Design[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_DESIGNS));
      return MOCK_DESIGNS;
    }
    return JSON.parse(data);
  },
};
