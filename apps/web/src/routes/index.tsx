import { createBrowserRouter } from 'react-router-dom';
import { AppLayout, AuthLayout } from '@/layouts';
import { NotFound, ErrorBoundary } from '@/components/error';
import { ROUTES, PERMISSIONS } from '@/constants';
import { AuthGuard } from './guards/AuthGuard';
import { PermissionGuard } from './guards/PermissionGuard';
import { UserList, UserForm, RoleMatrix } from '@/modules/user-roles';

export const router = createBrowserRouter([
  {
    path: ROUTES.AUTH.LOGIN,
    element: <AuthLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <div>Login Page Placeholder</div>,
      },
    ],
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <AppLayout />
      </AuthGuard>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <div>Dashboard Placeholder</div>,
      },
      {
        path: ROUTES.USERS.LIST,
        element: (
          <PermissionGuard permission={PERMISSIONS.USERS_MANAGE}>
            <UserList />
          </PermissionGuard>
        ),
      },
      {
        path: ROUTES.USERS.NEW,
        element: (
          <PermissionGuard permission={PERMISSIONS.USERS_MANAGE}>
            <UserForm />
          </PermissionGuard>
        ),
      },
      {
        path: ROUTES.USERS.EDIT,
        element: (
          <PermissionGuard permission={PERMISSIONS.USERS_MANAGE}>
            <UserForm />
          </PermissionGuard>
        ),
      },
      {
        path: ROUTES.USERS.ROLES,
        element: (
          <PermissionGuard permission={PERMISSIONS.USERS_MANAGE}>
            <RoleMatrix />
          </PermissionGuard>
        ),
      },
      // Other modules will be registered here
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
