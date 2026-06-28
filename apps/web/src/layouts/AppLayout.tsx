import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';

export function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar: Icon-only on md (w-20), full width on lg (w-64) */}
      <Sidebar className="hidden md:flex flex-col border-r bg-card w-20 lg:w-64 transition-all duration-300" />
      
      <div className="flex flex-1 flex-col overflow-hidden relative">
        <TopBar />
        
        {/* Main Content Area */}
        {/* Add padding-bottom on mobile (pb-20) to ensure content isn't hidden behind BottomNav */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-secondary/20 pb-24 md:pb-6">
          <Outlet />
        </main>
        
        {/* Bottom Navigation for mobile screens */}
        <BottomNav />
      </div>
    </div>
  );
}
