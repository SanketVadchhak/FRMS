import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import { ROUTES } from '@/constants';
import { LoadingScreen } from '@/components';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { initialized, user, isExpired, restoreSession } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (!initialized) {
      restoreSession();
    }
  }, [initialized, restoreSession]);

  if (!initialized) {
    return <LoadingScreen />;
  }

  // If no user or session expired, redirect to login
  if (!user || isExpired()) {
    return <Navigate to={ROUTES.AUTH.LOGIN} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
