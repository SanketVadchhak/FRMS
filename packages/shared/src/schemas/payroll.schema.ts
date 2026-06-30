import { z } from 'zod';

export enum PayrollStatus {
  DRAFT = 'DRAFT',
  GENERATED = 'GENERATED',
  LOCKED = 'LOCKED',
  PAID = 'PAID',
}

export const payrollSchema = z.object({
  id: z.string().optional(),
  
  // Period
  payrollPeriodStart: z.string().min(1, 'Period start is required'),
  payrollPeriodEnd: z.string().min(1, 'Period end is required'),
  
  // Employee details snapshot
  employeeId: z.string().min(1, 'Employee is required'),
  employeeName: z.string().min(1, 'Employee name is required'),
  department: z.string().optional(),
  
  // Rate snapshot
  hourlyRate: z.number().min(0, 'Hourly rate cannot be negative'),
  
  // Computed values
  totalHours: z.number().default(0),
  basicWage: z.number().default(0),
  bonus: z.number().default(0),
  grossPay: z.number().default(0),
  
  // Payment integration
  totalAdditions: z.number().default(0),
  totalDeductions: z.number().default(0),
  netPay: z.number().default(0),
  
  // Optional remarks
  notes: z.string().optional(),
  
  // Line item references (audit trail)
  productionEntryIds: z.array(z.string()).default([]),
  paymentIds: z.array(z.string()).default([]),
  
  // Status and Audit
  status: z.nativeEnum(PayrollStatus).default(PayrollStatus.DRAFT),
  generatedAt: z.string().datetime().optional(),
  generatedBy: z.string().optional(),
  paidDate: z.string().datetime().optional(),
  
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type PayrollEntry = z.infer<typeof payrollSchema>;

export const payrollPreviewSchema = z.object({
  periodStart: z.string(),
  periodEnd: z.string(),
  totalEmployees: z.number(),
  totalHours: z.number(),
  totalGross: z.number(),
  totalAdditions: z.number(),
  totalDeductions: z.number(),
  totalNet: z.number(),
});

export type PayrollPreview = z.infer<typeof payrollPreviewSchema>;

export interface PayrollTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  runningBalance: number;
}

export interface PayrollLedgerSummary {
  employeeId: string;
  employeeName: string;
  department?: string;
  
  // Current Period Scope
  totalHours: number;
  productionQty: number;
  productionBonus: number;
  
  // Payroll (Period Scope)
  hourlyRate: number;
  basicSalary: number;
  payrollBonus: number;
  payrollAdditions: number;
  payrollDeductions: number;
  netSalary: number;
  
  // Payments & Ledger
  openingBalance: number;
  advancesTaken: number;
  finesIncurred: number;
  salaryPaid: number;
  closingBalance: number;
  
  
  // Status
  paymentStatus: 'PAID' | 'PARTIALLY_PAID' | 'UNPAID';
  hasGeneratedPayroll: boolean;
  transactions: PayrollTransaction[];
}
