export const ROUTES = {
  AUTH: {
    LOGIN: '/login',
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
  PAYROLL: '/payroll',
  REPORTS: '/reports',
  NOTIFICATIONS: '/notifications',
  DATA: '/data',
  USERS: {
    LIST: '/users',
    NEW: '/users/new',
    EDIT: '/users/:id',
    ROLES: '/users/roles',
  },
  SETTINGS: '/settings',
} as const;
