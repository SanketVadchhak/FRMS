import { NavLink } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { usePermissions } from '@/hooks/usePermissions';
import { ROUTES, PERMISSIONS } from '@/constants';
import { LayoutDashboard, Users } from 'lucide-react';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { can } = usePermissions();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
      isActive && "bg-muted text-primary"
    );

  return (
    <aside className={cn("border-r bg-muted/40 block", className)}>
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <NavLink to="/" className="flex items-center gap-2 font-semibold">
          <span className="text-lg tracking-tight">FRMS</span>
        </NavLink>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          <div className="text-muted-foreground px-2 py-2 text-xs font-semibold uppercase tracking-wider">
            Navigation
          </div>
          <NavLink to={ROUTES.DASHBOARD} className={navLinkClass}>
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </NavLink>
          
          {can(PERMISSIONS.USERS_MANAGE) && (
            <>
              <div className="text-muted-foreground px-2 py-2 mt-4 text-xs font-semibold uppercase tracking-wider">
                Administration
              </div>
              <NavLink to={ROUTES.USERS.LIST} className={navLinkClass}>
                <Users className="h-4 w-4" />
                Users & Roles
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </aside>
  );
}
