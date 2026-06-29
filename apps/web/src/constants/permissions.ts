export const PERMISSIONS = {
  EMPLOYEES_READ: 'employees:read',
  EMPLOYEES_WRITE: 'employees:write',
  EMPLOYEES_DELETE: 'employees:delete',
  USERS_MANAGE: 'users:manage',
  SETTINGS_READ: 'settings:read',
  SETTINGS_WRITE: 'settings:write',
  PRODUCTION_READ: 'production:read',
  PRODUCTION_WRITE: 'production:write',
  PRODUCTION_APPROVE: 'production:approve',
  PRODUCTION_MANAGE: 'production:manage',
  // See docs/SECURITY.md for full list
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];
