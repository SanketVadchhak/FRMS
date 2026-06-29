import { NavLink, Outlet } from 'react-router-dom';
import { PageHeader } from '@/components';
import { ROUTES } from '@/constants';
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSIONS, type Permission } from '@/constants';
import { cn } from '@/utils/cn';
import { Building2, Palette, Columns3, Users, Shield } from 'lucide-react';

interface SettingsTab {
  label: string;
  path: string;
  icon: React.ElementType;
  permission?: Permission;
}

const SETTINGS_TABS: SettingsTab[] = [
  {
    label: 'General',
    path: ROUTES.SETTINGS.GENERAL,
    icon: Building2,
  },
  {
    label: 'Appearance',
    path: ROUTES.SETTINGS.APPEARANCE,
    icon: Palette,
  },
  {
    label: 'Table Preferences',
    path: ROUTES.SETTINGS.TABLES,
    icon: Columns3,
  },
  {
    label: 'Users',
    path: ROUTES.USERS.LIST,
    icon: Users,
    permission: PERMISSIONS.USERS_MANAGE,
  },
  {
    label: 'Roles & Permissions',
    path: ROUTES.USERS.ROLES,
    icon: Shield,
    permission: PERMISSIONS.USERS_MANAGE,
  },
];

export function SettingsLayout() {
  const { can } = usePermissions();
  
  const visibleTabs = SETTINGS_TABS.filter(
    (tab) => !tab.permission || can(tab.permission)
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage application preferences and system administration"
      />

      <div className="flex flex-col md:flex-row gap-6">
        {/* Mobile: horizontal scrolling tabs. Desktop: vertical left menu */}
        <nav className="flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 md:w-64 shrink-0 scrollbar-none border-b md:border-b-0 md:border-r border-border/50">
          {visibleTabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )
              }
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </NavLink>
          ))}
        </nav>

        {/* Right Content Area */}
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
