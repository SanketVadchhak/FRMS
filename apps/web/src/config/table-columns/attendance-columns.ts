import type { ColumnDef } from '@/hooks/useColumnPreferences';

export const attendanceColumns: ColumnDef[] = [
  { id: 'date', label: 'Date', defaultVisible: true },
  { id: 'employee', label: 'Employee', defaultVisible: true },
  { id: 'status', label: 'Status', defaultVisible: true },
  { id: 'totalWorkingHours', label: 'Working Hours', defaultVisible: true },
  { id: 'totalQuantity', label: 'Total Qty', defaultVisible: true },
  { id: 'totalEntries', label: 'Production Entries', defaultVisible: true },
];
