import type { Payment} from '@frms/shared';
import { PaymentEffect, PaymentStatus, PaymentType, PaymentMethod } from '@frms/shared';

// Initial Mock Data
let mockPayments: Payment[] = [
  {
    id: 'pay-001',
    employeeId: 'emp-1', // John Doe
    date: new Date().toISOString().split('T')[0] as string,
    amount: 1500,
    type: PaymentType.ADVANCE,
    effect: PaymentEffect.DEDUCTION,
    method: PaymentMethod.UPI,
    referenceNumber: 'UPI/123456789',
    reason: 'Medical advance',
    status: PaymentStatus.PENDING,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pay-002',
    employeeId: 'emp-2', // Jane Smith
    date: new Date().toISOString().split('T')[0] as string,
    amount: 500,
    type: PaymentType.BONUS_PAYMENT,
    effect: PaymentEffect.ADDITION,
    method: PaymentMethod.CASH,
    reason: 'Diwali bonus',
    status: PaymentStatus.SETTLED,
    createdAt: new Date().toISOString(),
  },
];

export const paymentMockApi = {
  async getPayments(): Promise<Payment[]> {
    return [...mockPayments].sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime());
  },

  async getPaymentsByEmployee(employeeId: string): Promise<Payment[]> {
    return mockPayments.filter(p => p.employeeId === employeeId);
  },

  async createPayment(data: Omit<Payment, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Payment> {
    const newPayment: Payment = {
      ...data,
      id: `pay-${Date.now()}`,
      status: PaymentStatus.PENDING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockPayments.push(newPayment);
    return newPayment;
  },

  async updatePayment(id: string, data: Partial<Payment>): Promise<Payment> {
    const index = mockPayments.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Payment not found');

    const updated = {
      ...mockPayments[index],
      ...data,
      updatedAt: new Date().toISOString(),
    } as Payment;
    mockPayments[index] = updated;
    return updated;
  },

  async deletePayment(id: string): Promise<void> {
    const index = mockPayments.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Payment not found');
    
    const payment = mockPayments[index];
    // Only allow deleting PENDING payments
    if (payment!.status === PaymentStatus.SETTLED) {
      throw new Error('Cannot delete settled payment');
    }

    mockPayments.splice(index, 1);
  },
  
  async settlePayments(ids: string[]): Promise<void> {
    mockPayments = mockPayments.map(p => {
      if (ids.includes(p.id!)) {
        return { ...p, status: PaymentStatus.SETTLED, updatedAt: new Date().toISOString() };
      }
      return p;
    });
  }
};
