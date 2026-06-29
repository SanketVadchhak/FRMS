import { z } from 'zod';

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
}

export const attendanceRecordSchema = z.object({
  id: z.string().uuid(),
  date: z.string(), // ISO date string YYYY-MM-DD
  employeeId: z.string().uuid(),
  employeeName: z.string(),
  status: z.nativeEnum(AttendanceStatus),
  totalEntries: z.number().int().min(0),
  totalQuantity: z.number().min(0),
  totalWorkingHours: z.number().min(0),
  firstEntryTime: z.string().optional(), // ISO string or time string
  lastEntryTime: z.string().optional(),
});

export type AttendanceRecord = z.infer<typeof attendanceRecordSchema>;

export const attendanceFilterSchema = z.object({
  date: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  employeeId: z.string().optional(),
  status: z.nativeEnum(AttendanceStatus).optional(),
});

export type AttendanceFilters = z.infer<typeof attendanceFilterSchema>;
