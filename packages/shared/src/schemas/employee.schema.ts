import { z } from 'zod';

export const employeeStatusEnum = z.enum(['ACTIVE', 'INACTIVE']);

export const employeeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  mobile: z.string().regex(/^\+?[0-9]{10,15}$/, 'Invalid mobile number format'),
  joiningDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  hourlyRate: z.number().min(0, 'Hourly rate cannot be negative'),
  status: employeeStatusEnum.default('ACTIVE'),
  notes: z.string().optional(),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code').optional().or(z.literal('')),
  // Audit fields — populated automatically by the service layer
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export const createEmployeeSchema = employeeSchema.omit({ id: true });
export const updateEmployeeSchema = employeeSchema.partial();

export type EmployeeCreateInput = z.infer<typeof createEmployeeSchema>;
export type EmployeeUpdateInput = z.infer<typeof updateEmployeeSchema>;
