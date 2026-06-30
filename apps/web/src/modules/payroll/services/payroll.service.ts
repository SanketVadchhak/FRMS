import type { PayrollEntry, PayrollPreview } from '@frms/shared';
import { payrollMockApi } from './payroll.mock';

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const payrollService = {
  async getPayrolls(): Promise<PayrollEntry[]> {
    await delay(500);
    return payrollMockApi.getPayrolls();
  },

  async previewPayroll(start: string, end: string): Promise<PayrollPreview> {
    await delay(800);
    return payrollMockApi.previewPayroll(start, end);
  },

  async generatePayroll(start: string, end: string, notes?: string): Promise<PayrollEntry[]> {
    await delay(1200);
    return payrollMockApi.generatePayroll(start, end, notes);
  },

  async lockPayroll(id: string): Promise<void> {
    await delay(400);
    return payrollMockApi.lockPayroll(id);
  },

  async markPaid(id: string): Promise<void> {
    await delay(600);
    return payrollMockApi.markPaid(id);
  }
};
