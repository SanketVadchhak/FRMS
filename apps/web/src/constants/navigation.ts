import {
  LayoutDashboard,
  Factory,
  HardHat,
  Banknote,
  FileText,
  Settings,
  Users,
  ClipboardCheck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ROUTES } from './routes';
import { PERMISSIONS } from './permissions';

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  permission?: string; // If omitted, accessible to all authenticated users
}

export const NAVIGATION_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    id: 'production',
    label: 'Production',
    path: ROUTES.PRODUCTION.LIST, // Assume we want to route to main production entry
    icon: Factory,
  },
  {
    id: 'approval_queue',
    label: 'Approval Queue',
    path: ROUTES.PRODUCTION.APPROVAL,
    icon: ClipboardCheck,
    permission: PERMISSIONS.PRODUCTION_APPROVE,
  },
  {
    id: 'workers',
    label: 'Workers',
    path: ROUTES.MASTERS.EMPLOYEES,
    icon: HardHat,
    permission: PERMISSIONS.EMPLOYEES_READ,
  },
  {
    id: 'payroll',
    label: 'Payroll',
    path: ROUTES.PAYROLL,
    icon: Banknote,
    // Add permission once backend defines payroll:read, but for now we leave it or mock it
  },
  {
    id: 'reports',
    label: 'Reports',
    path: ROUTES.REPORTS,
    icon: FileText,
  },
  {
    id: 'users',
    label: 'Users & Roles',
    path: ROUTES.USERS.LIST,
    icon: Users,
    permission: PERMISSIONS.USERS_MANAGE,
  },
  {
    id: 'settings',
    label: 'Settings',
    path: ROUTES.SETTINGS,
    icon: Settings,
    permission: PERMISSIONS.SETTINGS_READ,
  },
];
