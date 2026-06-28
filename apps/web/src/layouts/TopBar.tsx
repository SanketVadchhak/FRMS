import { MobileNav } from './MobileNav';

export function TopBar() {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
      <MobileNav />
      <div className="w-full flex-1">
        {/* Search can go here */}
      </div>
      <div className="flex items-center gap-4">
        {/* User menu and notifications can go here */}
      </div>
    </header>
  );
}
