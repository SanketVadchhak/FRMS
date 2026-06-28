import { useAuthStore } from '@/stores';
import type { Permission } from '@/constants';
import { PERMISSIONS } from '@/constants';
import { UserRole } from '@frms/shared';

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    PERMISSIONS.EMPLOYEES_READ, 
    PERMISSIONS.EMPLOYEES_WRITE, 
    PERMISSIONS.EMPLOYEES_DELETE, 
    PERMISSIONS.USERS_MANAGE
  ],
  [UserRole.SUPERVISOR]: [
    PERMISSIONS.EMPLOYEES_READ
  ],
  [UserRole.OPERATOR]: [
    PERMISSIONS.EMPLOYEES_READ
  ]
};

export function usePermissions() {
  const { user } = useAuthStore();
  
  const can = (permission: Permission) => {
    if (!user) return false;
    const userRole = user.role as UserRole;
    if (userRole === UserRole.ADMIN) return true; // ADMIN has all permissions
    return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
  };
  
  return { can };
}
