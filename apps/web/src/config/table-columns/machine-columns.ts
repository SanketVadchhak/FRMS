import type { ColumnDef } from '@/hooks/useColumnPreferences';

/**
 * Lightweight column metadata for the Machines table.
 * Used by Table Preferences to manage visibility/order.
 */
export const MACHINE_COLUMNS: ColumnDef[] = [
  { id: 'name',         label: 'Machine Name',  defaultVisible: true,  fixed: 'left' },
  { id: 'type',         label: 'Type',          defaultVisible: true  },
  { id: 'model',        label: 'Model',         defaultVisible: true  },
  { id: 'status',       label: 'Status',        defaultVisible: true  },
  { id: 'location',     label: 'Location',      defaultVisible: false },
  { id: 'purchase_date',label: 'Purchased',     defaultVisible: false },
  { id: 'notes',        label: 'Notes',         defaultVisible: false },
  { id: 'actions',      label: 'Actions',       defaultVisible: true,  fixed: 'right' },
];
