/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AppLayout, AuthLayout } from '@/layouts';
import { NotFound, ErrorBoundary } from '@/components/error';
import { ROUTES, PERMISSIONS } from '@/constants';
import { AuthGuard } from './guards/AuthGuard';
import { PermissionGuard } from './guards/PermissionGuard';

// Lazy loaded modules
const UserList = lazy(() => import('@/modules/user-roles').then(m => ({ default: m.UserList })));
const UserForm = lazy(() => import('@/modules/user-roles').then(m => ({ default: m.UserForm })));
const RoleMatrix = lazy(() => import('@/modules/user-roles').then(m => ({ default: m.RoleMatrix })));
const SettingsPage = lazy(() => import('@/modules/settings').then(m => ({ default: m.SettingsPage })));
const EmployeeList = lazy(() => import('@/modules/masters/employees').then(m => ({ default: m.EmployeeList })));

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
        path: ROUTES.MASTERS.EMPLOYEES,
        element: (
          <PermissionGuard permission={PERMISSIONS.EMPLOYEES_READ}>
            <EmployeeList />
          </PermissionGuard>
        ),
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
      {
        path: ROUTES.SETTINGS,
        element: (
          <PermissionGuard permission={PERMISSIONS.SETTINGS_READ}>
            <SettingsPage />
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
