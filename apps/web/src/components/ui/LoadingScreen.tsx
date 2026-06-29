import { Factory } from 'lucide-react';

export function LoadingScreen() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6 animate-pulse">
        <div className="rounded-2xl bg-primary/10 p-4">
          <Factory className="h-12 w-12 text-primary" />
        </div>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-xl font-bold tracking-tight">FRMS</h1>
          <p className="text-sm text-muted-foreground">Restoring secure session...</p>
        </div>
        <div className="h-1 w-24 overflow-hidden rounded-full bg-secondary/50">
          <div className="h-full bg-primary animate-pulse w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}
