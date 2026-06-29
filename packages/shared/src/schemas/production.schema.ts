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

export const productionDetailSchema = z.object({
  id: z.string().optional(),
  designId: z.string().min(1, 'Design is required'),
  completedPieces: z.number().min(1, "Must complete at least 1 piece"),
  rejectedPieces: z.number().min(0).default(0),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)"),
});

export const productionEntrySchema = z.object({
  id: z.string().optional(),
  date: z.string().min(1, 'Date is required'), // ISO Date string e.g. YYYY-MM-DD
  employeeId: z.string().min(1, 'Employee is required'),
  machineId: z.string().min(1, 'Machine is required'),
  shift: z.nativeEnum(ShiftType),
  details: z.array(productionDetailSchema).min(1, "At least one design card is required"),
  framesChanged: z.number().min(0).default(0),
  threadBreakage: z.number().min(0).default(0),
  bonus: z.number().min(0).default(0),
  notes: z.string().optional(),
  status: z.nativeEnum(ProductionStatus).default(ProductionStatus.DRAFT),
  rejectionReason: z.string().optional(),
});

export type ProductionDetail = z.infer<typeof productionDetailSchema>;
export type ProductionEntry = z.infer<typeof productionEntrySchema>;
