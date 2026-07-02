import { apiClient } from '@/lib/apiClient';
import type { Design, DesignCreateInput, DesignUpdateInput } from '@frms/shared';

export const designService = {
  getDesigns: async (): Promise<Design[]> => {
    return apiClient.get<Design[]>('/designs');
  },

  createDesign: async (data: DesignCreateInput): Promise<Design> => {
    return apiClient.post<Design>('/designs', data);
  },

  updateDesign: async (id: string, data: DesignUpdateInput): Promise<Design> => {
    return apiClient.put<Design>(`/designs/${id}`, data);
  },

  deleteDesign: async (id: string): Promise<void> => {
    return apiClient.delete(`/designs/${id}`);
  }
};
