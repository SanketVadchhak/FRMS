export const PERMISSIONS = {
  EMPLOYEES_READ: 'employees:read',
  EMPLOYEES_WRITE: 'employees:write',
  EMPLOYEES_DELETE: 'employees:delete',
  USERS_MANAGE: 'users:manage',
  SETTINGS_READ: 'settings:read',
  SETTINGS_WRITE: 'settings:write',
  // See docs/SECURITY.md for full list
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];
