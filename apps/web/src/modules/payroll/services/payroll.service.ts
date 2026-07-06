import { apiClient } from '@/lib/apiClient';
import type { PayrollEntry } from '@frms/shared';

// For preview/batch generation we will simulate it in frontend by calling /employees and /production if needed
// Or we just throw not implemented if the backend doesn't support the batch yet, but let's try our best.

export const payrollService = {
  getPayrolls: () => apiClient.get<PayrollEntry[]>('/payroll'),

  // Preview is now computed locally by usePayrollLedger to avoid duplicate backend logic
  async generatePayrollBatch(entries: PayrollEntry[]): Promise<{ count: number }> {
    return apiClient.post<{ count: number }>('/payroll/batch', entries);
  },

  lockPayroll: (id: string) => apiClient.post(`/payroll/${id}/lock`, {}),
  markPaid: (id: string) => apiClient.post(`/payroll/${id}/pay`, { paymentMethod: 'CASH' }),
};
