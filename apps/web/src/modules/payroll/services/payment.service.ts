import { apiClient } from '@/lib/apiClient';
import type { Payment } from '@frms/shared';

export const paymentService = {
  getPayments: async (): Promise<Payment[]> => {
    // Falls back to empty if backend endpoint isn't fully implemented
    return apiClient.get<Payment[]>('/payroll/payments').catch(() => []);
  },

  createPayment: async (data: Partial<Payment>): Promise<Payment> => {
    return apiClient.post<Payment>('/payroll/payments', data);
  },

  updatePayment: async (id: string, data: Partial<Payment>): Promise<Payment> => {
    return apiClient.put<Payment>(`/payroll/payments/${id}`, data);
  },

  deletePayment: async (id: string): Promise<void> => {
    return apiClient.delete(`/payroll/payments/${id}`);
  }
};
