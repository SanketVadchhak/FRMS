import type { Machine } from '@frms/shared';
import { MachineStatus } from '@frms/shared';

const STORAGE_KEY = 'frms_machines';

const MOCK_MACHINES: Machine[] = [
  { id: 'm1', name: 'Tajima 12-Head', status: MachineStatus.ACTIVE },
  { id: 'm2', name: 'Barudan 20-Head', status: MachineStatus.ACTIVE },
  { id: 'm3', name: 'SWF 15-Head', status: MachineStatus.MAINTENANCE },
];

export const mockMachineService = {
  getMachines: async (): Promise<Machine[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_MACHINES));
      return MOCK_MACHINES;
    }
    return JSON.parse(data);
  },
};
