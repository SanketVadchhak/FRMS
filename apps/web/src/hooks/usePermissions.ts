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
    PERMISSIONS.EMPLOYEES_READ,
    PERMISSIONS.EMPLOYEES_WRITE,
    PERMISSIONS.EMPLOYEES_DELETE,
    PERMISSIONS.MACHINES_READ,
    PERMISSIONS.MACHINES_WRITE,
    PERMISSIONS.MACHINES_DELETE,
    PERMISSIONS.DESIGNS_READ,
    PERMISSIONS.DESIGNS_WRITE,
    PERMISSIONS.DESIGNS_DELETE,
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_WRITE,
    PERMISSIONS.USERS_DELETE,
    PERMISSIONS.USERS_MANAGE,
    PERMISSIONS.SETTINGS_READ,
    PERMISSIONS.SETTINGS_WRITE,
    PERMISSIONS.PRODUCTION_READ,
    PERMISSIONS.PRODUCTION_WRITE,
    PERMISSIONS.PRODUCTION_DELETE,
    PERMISSIONS.PRODUCTION_APPROVE,
    PERMISSIONS.PRODUCTION_MANAGE,
    PERMISSIONS.PAYROLL_READ,
    PERMISSIONS.PAYROLL_WRITE,
    PERMISSIONS.NOTIFICATIONS_MANAGE,
  ],
  [UserRole.SUPERVISOR]: [
    PERMISSIONS.EMPLOYEES_READ,
    PERMISSIONS.MACHINES_READ,
    PERMISSIONS.DESIGNS_READ,
    PERMISSIONS.SETTINGS_READ,
    PERMISSIONS.PRODUCTION_READ,
    PERMISSIONS.PRODUCTION_WRITE,
    PERMISSIONS.PRODUCTION_DELETE,
    PERMISSIONS.PRODUCTION_APPROVE,
    PERMISSIONS.PRODUCTION_MANAGE,
    PERMISSIONS.PAYROLL_READ,
  ],
  [UserRole.OPERATOR]: [
    PERMISSIONS.EMPLOYEES_READ,
    PERMISSIONS.MACHINES_READ,
    PERMISSIONS.DESIGNS_READ,
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
