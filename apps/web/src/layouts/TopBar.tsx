import { GlobalSearch } from '@/components/GlobalSearch';
import { UserMenu } from '../modules/auth/components/UserMenu';
import { NotificationMenu } from './components/NotificationMenu';

export function TopBar() {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="flex-1 flex items-center justify-start md:justify-center px-4">
        <GlobalSearch />
      </div>
      
      <div className="flex items-center gap-4">
        <NotificationMenu />

        <div className="h-4 w-px bg-border hidden sm:block" />

        <div className="flex items-center gap-2">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
