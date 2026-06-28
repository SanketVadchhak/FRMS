import { cn } from '@/utils/cn';

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border bg-card text-card-foreground shadow", className)}>
      <div className="p-6 space-y-4">
        <div className="h-5 w-1/3 animate-pulse rounded bg-muted"></div>
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-muted"></div>
          <div className="h-4 w-4/5 animate-pulse rounded bg-muted"></div>
        </div>
      </div>
    </div>
  );
}
