/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout, AuthLayout } from '@/layouts';
import { NotFound, ErrorBoundary } from '@/components/error';
import { ROUTES, PERMISSIONS } from '@/constants';
import { AuthGuard } from './guards/AuthGuard';
import { PermissionGuard } from './guards/PermissionGuard';



// Lazy loaded modules
const UserList = lazy(() => import('@/modules/user-roles').then(m => ({ default: m.UserList })));
const UserForm = lazy(() => import('@/modules/user-roles').then(m => ({ default: m.UserForm })));
const RoleMatrix = lazy(() => import('@/modules/user-roles').then(m => ({ default: m.RoleMatrix })));
const SettingsLayout = lazy(() => import('@/modules/settings').then(m => ({ default: m.SettingsLayout })));
const CompanySettingsForm = lazy(() => import('@/modules/settings').then(m => ({ default: m.CompanySettingsForm })));
const ThemeSelector = lazy(() => import('@/modules/settings').then(m => ({ default: m.ThemeSelector })));
const TablePreferencesPage = lazy(() => import('@/modules/settings').then(m => ({ default: m.TablePreferencesPage })));
const EmployeeList = lazy(() => import('@/modules/masters/employees').then(m => ({ default: m.EmployeeList })));
const MachineList = lazy(() => import('@/modules/masters/machines').then(m => ({ default: m.MachineList })));
const ProductionList = lazy(() => import('@/modules/production').then(m => ({ default: m.ProductionList })));
const ProductionEntry = lazy(() => import('@/modules/production').then(m => ({ default: m.ProductionEntry })));
const ApprovalQueue = lazy(() => import('@/modules/production').then(m => ({ default: m.ApprovalQueue })));
const DashboardPage = lazy(() => import('@/modules/dashboard').then(m => ({ default: m.DashboardPage })));
const LoginPage = lazy(() => import('@/modules/auth').then(m => ({ default: m.LoginPage })));
const ProfilePage = lazy(() => import('@/modules/auth').then(m => ({ default: m.ProfilePage })));
const PayrollWorkspace = lazy(() => import('@/modules/payroll/pages/PayrollWorkspace').then(m => ({ default: m.PayrollWorkspace })));


export const router = createBrowserRouter([
  {
    path: ROUTES.AUTH.LOGIN,
    element: <AuthLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <LoginPage />,
      },
    ],
  },
  // Redirects for legacy routes
  {
    path: '/users',
    element: <Navigate to={ROUTES.USERS.LIST} replace />,
  },
  {
    path: '/users/new',
    element: <Navigate to={ROUTES.USERS.NEW} replace />,
  },
  {
    path: '/users/roles',
    element: <Navigate to={ROUTES.USERS.ROLES} replace />,
  },
  {
    path: '/users/:id',
    element: <Navigate to="/settings/users/:id" replace />,
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
        element: <DashboardPage />,
      },
      {
        path: ROUTES.AUTH.PROFILE,
        element: <ProfilePage />,
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
        path: ROUTES.MASTERS.MACHINES,
        element: (
          <PermissionGuard permission={PERMISSIONS.MACHINES_READ}>
            <MachineList />
          </PermissionGuard>
        ),
      },
      {
        path: ROUTES.SETTINGS.ROOT,
        element: (
          <PermissionGuard permission={PERMISSIONS.SETTINGS_READ}>
            <SettingsLayout />
          </PermissionGuard>
        ),
        children: [
          {
            index: true,
            element: <Navigate to={ROUTES.SETTINGS.GENERAL} replace />,
          },
          {
            path: ROUTES.SETTINGS.GENERAL,
            element: <CompanySettingsForm />,
          },
          {
            path: ROUTES.SETTINGS.APPEARANCE,
            element: <ThemeSelector />,
          },
          {
            path: ROUTES.SETTINGS.TABLES,
            element: <TablePreferencesPage />,
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
            path: ROUTES.USERS.ROLES,
            element: (
              <PermissionGuard permission={PERMISSIONS.USERS_MANAGE}>
                <RoleMatrix />
              </PermissionGuard>
            ),
          },
        ],
      },
      // Standalone forms for Settings modules (e.g. User creation) that shouldn't have the side menu
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
        path: ROUTES.PRODUCTION.LIST,
        element: (
          <PermissionGuard permission={PERMISSIONS.PRODUCTION_READ}>
            <ProductionList />
          </PermissionGuard>
        ),
      },
      {
        path: ROUTES.PRODUCTION.NEW,
        element: (
          <PermissionGuard permission={PERMISSIONS.PRODUCTION_WRITE}>
            <ProductionEntry />
          </PermissionGuard>
        ),
      },
      {
        path: ROUTES.PRODUCTION.EDIT,
        element: (
          <PermissionGuard permission={PERMISSIONS.PRODUCTION_WRITE}>
            <ProductionEntry />
          </PermissionGuard>
        ),
      },
      {
        path: ROUTES.PRODUCTION.APPROVAL,
        element: (
          <PermissionGuard permission={PERMISSIONS.PRODUCTION_APPROVE}>
            <ApprovalQueue />
          </PermissionGuard>
        ),
      },
      { path: 'payroll', element: <PayrollWorkspace /> },

      // Other modules will be registered here
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
