import { Bell } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { NAVIGATION_ITEMS } from '@/constants';
import { UserMenu } from '../modules/auth/components/UserMenu';

export function TopBar() {
  const location = useLocation();

  // Find the current module name based on path for breadcrumb context
  const currentNav = NAVIGATION_ITEMS.find(item => 
    location.pathname === item.path || 
    (item.path !== '/' && location.pathname.startsWith(item.path))
  );

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="flex-1 flex items-center">
        {/* Breadcrumb / Context */}
        <div className="hidden sm:flex items-center text-sm font-medium text-muted-foreground">
          {currentNav ? (
            <>
              <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
              <span className="mx-2 opacity-50">/</span>
              <span className="text-foreground">{currentNav.label}</span>
            </>
          ) : (
            <span className="text-foreground">Factory Resource Management</span>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button 
          className="relative p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-destructive border-2 border-card" />
        </button>

        <div className="h-4 w-px bg-border hidden sm:block" />

        <div className="flex items-center gap-2">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
