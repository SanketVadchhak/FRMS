import { useAuthStore } from '@/stores';
import type { Permission } from '@/constants';
import { PERMISSIONS } from '@/constants';
import { UserRole } from '@frms/shared';

/**
 * Maps each role to its granted permissions.
 *
 * Rules:
 * - ADMIN has all permissions (short-circuited in `can()`).
 * - SUPERVISOR can read + approve production; read employees and settings.
 * - OPERATOR can read + write production; read employees.
 *
 * When new permissions are added to PERMISSIONS, update this map.
 */
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    // Employees
    PERMISSIONS.EMPLOYEES_READ,
    PERMISSIONS.EMPLOYEES_WRITE,
    PERMISSIONS.EMPLOYEES_DELETE,
    // Users
    PERMISSIONS.USERS_MANAGE,
    // Settings
    PERMISSIONS.SETTINGS_READ,
    PERMISSIONS.SETTINGS_WRITE,
    // Production
    PERMISSIONS.PRODUCTION_READ,
    PERMISSIONS.PRODUCTION_WRITE,
    PERMISSIONS.PRODUCTION_APPROVE,
    PERMISSIONS.PRODUCTION_MANAGE,
  ],
  [UserRole.SUPERVISOR]: [
    PERMISSIONS.EMPLOYEES_READ,
    PERMISSIONS.SETTINGS_READ,
    PERMISSIONS.PRODUCTION_READ,
    PERMISSIONS.PRODUCTION_APPROVE,
  ],
  [UserRole.OPERATOR]: [
    PERMISSIONS.EMPLOYEES_READ,
    PERMISSIONS.SETTINGS_READ,
    PERMISSIONS.PRODUCTION_READ,
    PERMISSIONS.PRODUCTION_WRITE,
  ],
};

export function usePermissions() {
  const { user } = useAuthStore();

  const can = (permission: Permission): boolean => {
    if (!user) return false;
    const userRole = user.role as UserRole;
    // ADMIN bypasses all permission checks
    if (userRole === UserRole.ADMIN) return true;
    return ROLE_PERMISSIONS[userRole]?.includes(permission) ?? false;
  };

  return { can };
}
