import { Menu } from 'lucide-react';

export function MobileNav() {
  return (
    <button className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground">
      <Menu className="h-5 w-5" />
      <span className="sr-only">Toggle Menu</span>
    </button>
  );
}
