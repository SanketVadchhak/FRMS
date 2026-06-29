import { useState, useRef, useEffect } from 'react';
import { UserCircle2, LogOut, Settings, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { ROUTES } from '@/constants';
import { cn } from '@/utils/cn';
import { useLogout } from '../hooks/useAuth';

export function UserMenu() {
  const { user } = useAuthStore();
  const logoutMutation = useLogout();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const handleLogout = () => {
    setIsOpen(false);
    logoutMutation.mutate();
  };

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 rounded-full hover:bg-muted/50 p-1 pr-3 transition-colors focus:outline-none focus:ring-2 focus:ring-ring",
          isOpen && "bg-muted/50"
        )}
      >
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <UserCircle2 className="h-5 w-5" />
        </div>
        <div className="hidden sm:flex flex-col items-start">
          <span className="text-sm font-medium leading-none">{user.username}</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">{user.role}</span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-md border bg-card shadow-lg ring-1 ring-black/5 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b bg-muted/20">
            <p className="text-sm font-medium">{user.username}</p>
            <p className="text-xs text-muted-foreground truncate">Role: {user.role}</p>
          </div>
          <div className="p-1">
            <Link
              to={ROUTES.AUTH.PROFILE}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-sm transition-colors"
            >
              <UserIcon className="h-4 w-4 text-muted-foreground" />
              Profile
            </Link>
            <button
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground rounded-sm transition-colors cursor-not-allowed opacity-50"
              disabled
              title="Coming Soon"
            >
              <Settings className="h-4 w-4" />
              Preferences
            </button>
            <div className="h-px bg-border my-1" />
            <button
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-sm transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
