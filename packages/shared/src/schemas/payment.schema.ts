import { z } from 'zod';

export enum PaymentType {
  ADVANCE = 'ADVANCE',
  LOAN = 'LOAN',
  ADJUSTMENT = 'ADJUSTMENT',
  BONUS_PAYMENT = 'BONUS_PAYMENT',
  FINE = 'FINE',
  SALARY = 'SALARY',
  OTHER = 'OTHER',
}

export enum PaymentEffect {
  ADDITION = 'ADDITION',
  DEDUCTION = 'DEDUCTION',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SETTLED = 'SETTLED',
}

export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  UPI = 'UPI',
  CHEQUE = 'CHEQUE',
  OTHER = 'OTHER',
}

export const paymentSchema = z.object({
  id: z.string().optional(),
  employeeId: z.string().min(1, 'Employee is required'),
  date: z.string().min(1, 'Date is required'), // YYYY-MM-DD
  amount: z.number().min(0, 'Amount must be positive'),
  type: z.nativeEnum(PaymentType),
  effect: z.nativeEnum(PaymentEffect),
  method: z.nativeEnum(PaymentMethod).default(PaymentMethod.CASH),
  referenceNumber: z.string().optional(),
  reason: z.string().optional(),
  status: z.nativeEnum(PaymentStatus).default(PaymentStatus.PENDING),
  
  // Audit
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  createdBy: z.string().optional(),
});

export type Payment = z.infer<typeof paymentSchema>;
export type CreatePaymentDto = Omit<Payment, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'status'>;
