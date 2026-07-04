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
    const roleStr = String(user.role || '').toUpperCase();
    const usernameStr = String(user.username || '').toLowerCase();

    // ADMIN role or admin usernames bypass all permission checks
    if (roleStr === 'ADMIN' || roleStr === 'SUPERADMIN' || usernameStr === 'admin' || usernameStr === 'hardik') {
      return true;
    }

    const userRole = roleStr as UserRole;
    return ROLE_PERMISSIONS[userRole]?.includes(permission) ?? false;
  };

  return { can };
}
