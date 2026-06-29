import type { ColumnDef } from '@/hooks/useColumnPreferences';

/**
 * Lightweight column metadata for the Employees table.
 * Used by Table Preferences to manage visibility/order.
 * No render functions — those live in EmployeeList.tsx.
 */
export const EMPLOYEE_COLUMNS: ColumnDef[] = [
  { id: 'name',         label: 'Name',         defaultVisible: true,  fixed: 'left' },
  { id: 'mobile',       label: 'Mobile',        defaultVisible: true  },
  { id: 'status',       label: 'Status',        defaultVisible: true  },
  { id: 'hourly_rate',  label: 'Rate / Hr',     defaultVisible: true  },
  { id: 'joining_date', label: 'Joined',        defaultVisible: true  },
  { id: 'bank_name',    label: 'Bank',          defaultVisible: false },
  { id: 'account_no',   label: 'Account No.',   defaultVisible: false },
  { id: 'ifsc',         label: 'IFSC Code',     defaultVisible: false },
  { id: 'notes',        label: 'Notes',         defaultVisible: false },
  { id: 'actions',      label: 'Actions',       defaultVisible: true,  fixed: 'right' },
];
