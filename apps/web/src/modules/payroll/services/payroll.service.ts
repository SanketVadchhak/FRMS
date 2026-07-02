import { apiClient } from '@/lib/apiClient';
import type { PayrollEntry, PayrollPreview } from '@frms/shared';

// For preview/batch generation we will simulate it in frontend by calling /employees and /production if needed
// Or we just throw not implemented if the backend doesn't support the batch yet, but let's try our best.

export const payrollService = {
  getPayrolls: () => apiClient.get<PayrollEntry[]>('/payroll'),

  // Assuming preview is still mocked or computed locally for now
  async previewPayroll(_start: string, _end: string): Promise<PayrollPreview> {
    throw new Error('Not fully implemented with backend API yet');
  },

  async generatePayroll(_start: string, _end: string, _notes?: string): Promise<PayrollEntry[]> {
    throw new Error('Not fully implemented with backend API yet');
  },

  lockPayroll: (id: string) => apiClient.post(`/payroll/${id}/lock`, {}),
  markPaid: (id: string) => apiClient.post(`/payroll/${id}/pay`, { paymentMethod: 'CASH' }),
};
