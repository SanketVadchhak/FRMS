import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { usePermissions } from '@/hooks/usePermissions';
import { NAVIGATION_ITEMS } from '@/constants';
import type { Permission } from '@/constants';

export function BottomNav() {
  const { can } = usePermissions();
  const location = useLocation();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const accessibleItems = NAVIGATION_ITEMS.filter(
    (item) => !item.permission || can(item.permission as Permission)
  );

  // Mobile nav logic: Show max 4 items. If more than 4, show 3 + 'More' tab.
  const maxVisibleItems = 4;
  const needsMoreTab = accessibleItems.length > maxVisibleItems;
  
  const visibleItems = needsMoreTab ? accessibleItems.slice(0, 3) : accessibleItems;
  const moreItems = needsMoreTab ? accessibleItems.slice(3) : [];



  // Lock body scroll when "More" sheet is open
  useEffect(() => {
    if (isMoreOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMoreOpen]);


  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex flex-col items-center justify-center w-full h-full gap-1 text-[10px] font-medium transition-all duration-200 outline-none rounded-lg",
      isActive 
        ? "text-primary" 
        : "text-muted-foreground hover:text-foreground"
    );

  const moreTabActive = moreItems.some((item) => location.pathname.startsWith(item.path));

  return (
    <>
      <nav className="md:hidden fixed bottom-0 w-full z-50 bg-background/85 backdrop-blur-xl border-t shadow-[0_-4px_24px_rgba(0,0,0,0.02)] pb-safe">
        <div className="flex justify-around items-center h-16 px-2">
          {visibleItems.map((item) => (
            <NavLink key={item.id} to={item.path} className={navLinkClass}>
              {({ isActive }) => (
                <>
                  <div className={cn(
                    "flex items-center justify-center h-8 w-14 rounded-full transition-all duration-300",
                    isActive ? "bg-primary/10" : "bg-transparent"
                  )}>
                    <item.icon className={cn(
                      "h-5 w-5 transition-transform duration-300",
                      isActive ? "scale-110" : "scale-100"
                    )} />
                  </div>
                  <span className="truncate max-w-full px-1">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
          
          {needsMoreTab && (
            <button
              onClick={() => setIsMoreOpen(true)}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 text-[10px] font-medium transition-colors outline-none rounded-lg",
                moreTabActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "flex items-center justify-center h-8 w-14 rounded-full transition-all duration-300",
                moreTabActive ? "bg-primary/10" : "bg-transparent"
              )}>
                <Menu className={cn(
                  "h-5 w-5 transition-transform duration-300",
                  moreTabActive ? "scale-110" : "scale-100"
                )} />
              </div>
              <span>More</span>
            </button>
          )}
        </div>
      </nav>

      {/* "More" Bottom Sheet */}
      {isMoreOpen && (
        <>
          <div 
            className="md:hidden fixed inset-0 z-50 bg-background/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsMoreOpen(false)}
            aria-hidden="true"
          />
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-[24px] shadow-2xl animate-in slide-in-from-bottom duration-300 border-t pb-safe">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold pl-2">More Modules</h3>
              <button 
                onClick={() => setIsMoreOpen(false)}
                className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4 grid grid-cols-4 gap-y-6 gap-x-2 pb-10 max-h-[60vh] overflow-y-auto">
              {moreItems.map((item) => (
                <NavLink 
                  key={item.id} 
                  to={item.path}
                  className="flex flex-col items-center gap-2 group outline-none"
                  onClick={() => setIsMoreOpen(false)}
                >
                  {({ isActive }) => (
                    <>
                      <div className={cn(
                        "flex items-center justify-center h-14 w-14 rounded-2xl transition-all duration-300 border shadow-sm",
                        isActive 
                          ? "bg-primary/10 border-primary/20 text-primary" 
                          : "bg-background border-border text-muted-foreground group-hover:bg-muted group-hover:text-foreground"
                      )}>
                        <item.icon className="h-6 w-6" />
                      </div>
                      <span className={cn(
                        "text-[11px] font-medium text-center leading-tight px-1",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )}>
                        {item.label}
                      </span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
