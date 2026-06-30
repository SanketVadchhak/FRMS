import type { Payment, CreatePaymentDto } from '@frms/shared';
import { paymentMockApi } from './payment.mock';

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const paymentService = {
  async getPayments(): Promise<Payment[]> {
    await delay(500);
    return paymentMockApi.getPayments();
  },

  async createPayment(data: CreatePaymentDto): Promise<Payment> {
    await delay(600);
    return paymentMockApi.createPayment(data);
  },

  async updatePayment(id: string, data: Partial<Payment>): Promise<Payment> {
    await delay(600);
    return paymentMockApi.updatePayment(id, data);
  },

  async deletePayment(id: string): Promise<void> {
    await delay(500);
    return paymentMockApi.deletePayment(id);
  },
};
