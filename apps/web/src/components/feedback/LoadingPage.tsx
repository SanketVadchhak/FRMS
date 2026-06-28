import { LoadingSpinner } from './LoadingSpinner';

export function LoadingPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading FRMS...</p>
      </div>
    </div>
  );
}
