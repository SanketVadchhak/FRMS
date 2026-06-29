import type { ColumnDef } from '@/hooks/useColumnPreferences';

/**
 * Lightweight column metadata for the Users table.
 * Used by Table Preferences to manage visibility/order.
 */
export const USER_COLUMNS: ColumnDef[] = [
  { id: 'username',    label: 'Username',    defaultVisible: true,  fixed: 'left' },
  { id: 'role',        label: 'Role',        defaultVisible: true  },
  { id: 'status',      label: 'Status',      defaultVisible: true  },
  { id: 'last_login',  label: 'Last Login',  defaultVisible: true  },
  { id: 'created_at',  label: 'Created At',  defaultVisible: false },
  { id: 'updated_at',  label: 'Updated At',  defaultVisible: false },
  { id: 'actions',     label: 'Actions',     defaultVisible: true,  fixed: 'right' },
];
