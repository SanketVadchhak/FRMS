import { apiClient } from '@/lib/apiClient';
import type { ProductionEntry } from '@frms/shared';

export const productionService = {
  getEntries: () => apiClient.get<ProductionEntry[]>('/production'),
  getEntry: (id: string) => apiClient.get<ProductionEntry>(`/production/${id}`),
  createEntry: (data: Partial<ProductionEntry>) => apiClient.post<ProductionEntry>('/production', data),
  updateEntry: (id: string, data: Partial<ProductionEntry>) => apiClient.put<ProductionEntry>(`/production/${id}`, data),
  deleteEntry: (id: string) => apiClient.delete(`/production/${id}`),
  approveEntry: (id: string) => apiClient.post(`/production/${id}/approve`, {}),
  bulkApproveEntries: (ids: string[]) => apiClient.post('/production/bulk-approve', { ids }),
  rejectEntry: (id: string, reason: string) => apiClient.post(`/production/${id}/reject`, { reason }),
};
