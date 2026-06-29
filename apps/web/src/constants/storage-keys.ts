/**
 * Centralised localStorage key registry.
 *
 * All mock services MUST import their key from here.
 * This prevents typos, key collisions, and makes future
 * backend migration trivial (one place to update).
 */
export const STORAGE_KEYS = {
  PRODUCTION: 'frms_production',
  EMPLOYEES:  'frms_employees',
  MACHINES:   'frms_machines',
  DESIGNS:    'frms_designs',
  USERS:      'frms_users',
  SETTINGS:   'frms_settings',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
