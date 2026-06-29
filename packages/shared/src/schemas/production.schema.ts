import { z } from 'zod';

export enum ShiftType {
  DAY = 'DAY',
  NIGHT = 'NIGHT',
}

export enum ProductionStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

// Production session (one design run within a shift)
export const productionDetailSchema = z.object({
  id: z.string().optional(),
  designName: z.string().min(1, 'Design name is required'),
  totalStitches: z.number().min(0, 'Must be 0 or more').default(0),
});

export const productionEntrySchema = z.object({
  id: z.string().optional(),

  // Setup
  date: z.string().min(1, 'Date is required'),        // YYYY-MM-DD
  employeeId: z.string().min(1, 'Employee is required'),
  machineId: z.string().min(1, 'Machine is required'),
  shift: z.nativeEnum(ShiftType),

  // Production sessions (up to 2)
  details: z.array(productionDetailSchema).min(1, 'At least one production session is required'),

  // Aggregate production metrics (entry-level)
  productionQuantity: z.number().min(0).default(0),
  hoursWorked: z
    .number({ invalid_type_error: 'Hours worked is required' })
    .min(0.5, 'Minimum 0.5 hours')
    .max(24, 'Maximum 24 hours'),

  // Shift metrics
  framesChanged: z.number().min(0).default(0),
  threadBreakage: z.number().min(0).default(0),
  bonus: z.number().min(0).default(0),

  // Plain text notes — no JSON serialisation
  notes: z.string().optional(),

  // Approval workflow
  status: z.nativeEnum(ProductionStatus).default(ProductionStatus.DRAFT),
  rejectionReason: z.string().optional(),

  // Audit fields — populated automatically by the service layer
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
  approvedAt: z.string().datetime().optional(),
  approvedBy: z.string().optional(),
});

export type ProductionDetail = z.infer<typeof productionDetailSchema>;
export type ProductionEntry = z.infer<typeof productionEntrySchema>;
