import { Navigate } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';
import type { Permission } from '@/constants';
import { ROUTES } from '@/constants';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission: Permission;
}

export function PermissionGuard({ children, permission }: PermissionGuardProps) {
  const { can } = usePermissions();

  if (!can(permission)) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <>{children}</>;
}
