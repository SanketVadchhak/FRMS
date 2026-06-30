import type { LucideIcon } from 'lucide-react';
import { Factory, ClipboardCheck, HardHat, Banknote } from 'lucide-react';
import type { ColumnDef } from '@/hooks/useColumnPreferences';
import { PRODUCTION_LIST_COLUMNS, APPROVAL_QUEUE_COLUMNS } from '@/modules/production/constants/production-columns';
import { EMPLOYEE_COLUMNS } from './table-columns/employee-columns';
import { PAYROLL_WORKSPACE_COLUMNS } from './table-columns/payroll-workspace-columns';


export interface TableRegistryEntry {
  /** Unique identifier and localStorage key for this table's layout. */
  storageKey: string;
  /** Human-readable table name displayed on the card. */
  label: string;
  /** Sub-text on the preferences card. */
  description: string;
  /** Lucide icon to display on the card. */
  icon: LucideIcon;
  /** Column definitions — id, label, defaultVisible, fixed?. No render functions required. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<any, any>[];
}

/**
 * Central registry of all configurable ERP tables.
 *
 * To register a new table:
 * 1. Create a lightweight column-metadata file in src/config/table-columns/
 * 2. Add an entry here with its storageKey and column list.
 * The Table Preferences page will automatically render a card for it.
 */
export const TABLE_REGISTRY: TableRegistryEntry[] = [
  {
    storageKey: 'frms_production_columns',
    label: 'Production List',
    description: 'Daily factory production logs table',
    icon: Factory,
    columns: PRODUCTION_LIST_COLUMNS,
  },
  {
    storageKey: 'frms_approval_columns',
    label: 'Approval Queue',
    description: 'Pending production entries awaiting approval',
    icon: ClipboardCheck,
    columns: APPROVAL_QUEUE_COLUMNS,
  },
  {
    storageKey: 'frms_employee_columns',
    label: 'Employees',
    description: 'Worker master list',
    icon: HardHat,
    columns: EMPLOYEE_COLUMNS,
  },
  {
    storageKey: 'frms_payroll_workspace_columns',
    label: 'Payroll Workspace',
    description: 'Live payroll calculation and ledger',
    icon: Banknote,
    columns: PAYROLL_WORKSPACE_COLUMNS,
  },
];
