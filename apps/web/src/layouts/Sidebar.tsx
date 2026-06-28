import { NavLink } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { usePermissions } from '@/hooks/usePermissions';
import { NAVIGATION_ITEMS } from '@/constants';
import type { Permission } from '@/constants';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { can } = usePermissions();

  const accessibleItems = NAVIGATION_ITEMS.filter(
    (item) => !item.permission || can(item.permission as Permission)
  );

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-muted-foreground transition-all duration-200 group relative outline-none focus-visible:ring-2 focus-visible:ring-ring",
      isActive 
        ? "bg-primary/10 text-primary font-medium shadow-sm" 
        : "hover:bg-muted/80 hover:text-foreground"
    );

  return (
    <aside className={cn("bg-background block", className)}>
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <NavLink to="/" className="flex items-center gap-2 font-semibold">
          <span className="text-xl tracking-tight hidden lg:inline-block">FRMS</span>
          <span className="text-xl tracking-tight lg:hidden inline-block font-black text-primary">F</span>
        </NavLink>
      </div>
      <div className="flex-1 overflow-y-auto py-4 hide-scrollbar">
        <nav className="grid items-start px-3 text-sm font-medium gap-1 lg:px-4">
          <div className="text-muted-foreground/70 px-3 pb-2 pt-4 text-[10px] font-bold uppercase tracking-widest hidden lg:block">
            Menu
          </div>
          
          {accessibleItems.map((item) => (
            <NavLink 
              key={item.id} 
              to={item.path} 
              className={navLinkClass}
              title={item.label} // Tooltip for collapsed view
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              <span className="hidden lg:inline-block truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}
