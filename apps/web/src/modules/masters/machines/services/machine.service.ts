import { apiClient } from '@/lib/apiClient';
import type { Machine, MachineCreateInput, MachineUpdateInput } from '@frms/shared';

export const machineService = {
  getMachines: async (): Promise<Machine[]> => {
    return apiClient.get<Machine[]>('/machines');
  },

  createMachine: async (data: MachineCreateInput): Promise<Machine> => {
    return apiClient.post<Machine>('/machines', data);
  },

  updateMachine: async (id: string, data: MachineUpdateInput): Promise<Machine> => {
    return apiClient.put<Machine>(`/machines/${id}`, data);
  },

  deleteMachine: async (id: string): Promise<void> => {
    return apiClient.delete(`/machines/${id}`);
  }
};
