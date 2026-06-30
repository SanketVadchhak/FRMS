export const ROUTES = {
  AUTH: {
    LOGIN: '/login',
    PROFILE: '/profile',
  },
  DASHBOARD: '/',
  MASTERS: {
    EMPLOYEES: '/masters/employees',
    MACHINES: '/masters/machines',
    DESIGNS: '/masters/designs',
  },
  PRODUCTION: {
    LIST: '/production',
    NEW: '/production/new',
    EDIT: '/production/:id',
    APPROVAL: '/production/approval',
  },
  PAYROLL: {
    DASHBOARD: '/payroll',
    REGISTER: '/payroll/register',
    GENERATE: '/payroll/generate',
    PAYMENTS: '/payroll/payments',
  },

  NOTIFICATIONS: '/notifications',
  DATA: '/data',
  USERS: {
    LIST: '/settings/users',
    NEW: '/settings/users/new',
    EDIT: '/settings/users/:id',
    ROLES: '/settings/roles',
  },
  SETTINGS: {
    ROOT: '/settings',
    GENERAL: '/settings/general',
    APPEARANCE: '/settings/appearance',
    TABLES: '/settings/tables',
  },
} as const;
