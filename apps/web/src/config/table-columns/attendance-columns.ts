import type { TableColumnConfig } from '@/components/data-table/types';

export const attendanceColumns: TableColumnConfig[] = [
  { id: 'date', label: 'Date', defaultVisible: true, mandatory: true },
  { id: 'employee', label: 'Employee', defaultVisible: true, mandatory: true },
  { id: 'status', label: 'Status', defaultVisible: true },
  { id: 'totalWorkingHours', label: 'Working Hours', defaultVisible: true },
  { id: 'totalQuantity', label: 'Total Qty', defaultVisible: true },
  { id: 'totalEntries', label: 'Production Entries', defaultVisible: true },
];
