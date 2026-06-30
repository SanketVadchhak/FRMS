import type { 
  PayrollEntry, 
  PayrollPreview, 
  ProductionEntry, 
  Payment, 
  Employee 
} from '@frms/shared';
import { 
  PayrollStatus, 
  PaymentEffect, 
  PaymentStatus,
  ProductionStatus 
} from '@frms/shared';
import { paymentMockApi } from './payment.mock';
import { mockProductionService } from '../../production/services/production.mock';
import { employeeService } from '../../masters/employees/services/employee.mock';

const mockPayrolls: PayrollEntry[] = [];

export const payrollMockApi = {
  async getPayrolls(): Promise<PayrollEntry[]> {
    return [...mockPayrolls].sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  },

  async previewPayroll(periodStart: string, periodEnd: string): Promise<PayrollPreview> {
    // 1. Check for overlapping payrolls
    const hasOverlap = mockPayrolls.some(p => 
      (periodStart >= p.payrollPeriodStart && periodStart <= p.payrollPeriodEnd) ||
      (periodEnd >= p.payrollPeriodStart && periodEnd <= p.payrollPeriodEnd) ||
      (periodStart <= p.payrollPeriodStart && periodEnd >= p.payrollPeriodEnd)
    );
    if (hasOverlap) {
      throw new Error('A payroll already exists that overlaps with this period.');
    }

    const employees: Employee[] = await employeeService.getEmployees();
    const allProduction: ProductionEntry[] = await mockProductionService.getEntries();
    const allPayments: Payment[] = await paymentMockApi.getPayments();

    // Filter production entries
    const approvedProduction = allProduction.filter(p => 
      p.status === ProductionStatus.APPROVED && 
      p.date >= periodStart && 
      p.date <= periodEnd
    );

    // Filter payments
    const pendingPayments = allPayments.filter(p => 
      p.status === PaymentStatus.PENDING && 
      p.date >= periodStart && 
      p.date <= periodEnd
    );

    let totalEmployees = 0;
    let totalHours = 0;
    let totalGross = 0;
    let totalAdditions = 0;
    let totalDeductions = 0;
    let totalNet = 0;

    employees.forEach(emp => {
      const empProd = approvedProduction.filter(p => p.employeeId === emp.id);
      if (empProd.length === 0) return; // Skip employees with no production

      totalEmployees++;
      
      const hours = empProd.reduce((sum, p) => sum + p.hoursWorked, 0);
      const basicWage = hours * (emp.hourlyRate || 0);
      const bonus = empProd.reduce((sum, p) => sum + (p.bonus || 0), 0);
      const grossPay = basicWage + bonus;

      const empPayments = pendingPayments.filter(p => p.employeeId === emp.id);
      const additions = empPayments.filter(p => p.effect === PaymentEffect.ADDITION).reduce((sum, p) => sum + p.amount, 0);
      const deductions = empPayments.filter(p => p.effect === PaymentEffect.DEDUCTION).reduce((sum, p) => sum + p.amount, 0);
      
      const netPay = grossPay + additions - deductions;

      totalHours += hours;
      totalGross += grossPay;
      totalAdditions += additions;
      totalDeductions += deductions;
      totalNet += netPay;
    });

    return {
      periodStart,
      periodEnd,
      totalEmployees,
      totalHours,
      totalGross,
      totalAdditions,
      totalDeductions,
      totalNet
    };
  },

  async generatePayroll(periodStart: string, periodEnd: string, notes?: string): Promise<PayrollEntry[]> {
    // 1. Check for overlapping payrolls (again, to be safe)
    await this.previewPayroll(periodStart, periodEnd); // Will throw if overlap

    const employees: Employee[] = await employeeService.getEmployees();
    const allProduction: ProductionEntry[] = await mockProductionService.getEntries();
    const allPayments: Payment[] = await paymentMockApi.getPayments();

    const approvedProduction = allProduction.filter(p => 
      p.status === ProductionStatus.APPROVED && 
      p.date >= periodStart && 
      p.date <= periodEnd
    );

    const pendingPayments = allPayments.filter(p => 
      p.status === PaymentStatus.PENDING && 
      p.date >= periodStart && 
      p.date <= periodEnd
    );

    const newPayrolls: PayrollEntry[] = [];
    const timestamp = new Date().toISOString();

    employees.forEach(emp => {
      const empProd = approvedProduction.filter(p => p.employeeId === emp.id);
      if (empProd.length === 0) return;

      const hours = empProd.reduce((sum, p) => sum + p.hoursWorked, 0);
      const basicWage = hours * (emp.hourlyRate || 0);
      const bonus = empProd.reduce((sum, p) => sum + (p.bonus || 0), 0);
      const grossPay = basicWage + bonus;

      const empPayments = pendingPayments.filter(p => p.employeeId === emp.id);
      const additions = empPayments.filter(p => p.effect === PaymentEffect.ADDITION).reduce((sum, p) => sum + p.amount, 0);
      const deductions = empPayments.filter(p => p.effect === PaymentEffect.DEDUCTION).reduce((sum, p) => sum + p.amount, 0);
      
      const netPay = grossPay + additions - deductions;

      newPayrolls.push({
        id: `payroll-${Date.now()}-${emp.id}`,
        payrollPeriodStart: periodStart,
        payrollPeriodEnd: periodEnd,
        employeeId: emp.id!,
        employeeName: emp.name,
        department: 'Production',
        hourlyRate: emp.hourlyRate || 0, // Snapshot
        totalHours: hours,
        basicWage,
        bonus,
        grossPay,
        totalAdditions: additions,
        totalDeductions: deductions,
        netPay,
        notes,
        productionEntryIds: empProd.map(p => p.id!),
        paymentIds: empPayments.map(p => p.id!),
        status: PayrollStatus.GENERATED,
        generatedAt: timestamp,
        generatedBy: 'System', // In a real app, from auth token
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    });

    mockPayrolls.push(...newPayrolls);
    return newPayrolls;
  },

  async lockPayroll(id: string): Promise<void> {
    const p = mockPayrolls.find(x => x.id === id);
    if (!p) throw new Error('Not found');
    if (p.status !== PayrollStatus.GENERATED) throw new Error('Can only lock generated payroll');
    p.status = PayrollStatus.LOCKED;
    p.updatedAt = new Date().toISOString();
  },

  async markPaid(id: string): Promise<void> {
    const p = mockPayrolls.find(x => x.id === id);
    if (!p) throw new Error('Not found');
    if (p.status !== PayrollStatus.LOCKED) throw new Error('Can only pay locked payroll');
    
    p.status = PayrollStatus.PAID;
    p.paidDate = new Date().toISOString();
    p.updatedAt = new Date().toISOString();

    // Mark associated payments as SETTLED
    if (p.paymentIds.length > 0) {
      await paymentMockApi.settlePayments(p.paymentIds);
    }
  }
};
