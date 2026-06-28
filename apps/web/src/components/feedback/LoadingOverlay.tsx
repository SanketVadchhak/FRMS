import { LoadingSpinner } from './LoadingSpinner';
import { cn } from '@/utils/cn';

interface LoadingOverlayProps {
  isLoading: boolean;
  className?: string;
}

export function LoadingOverlay({ isLoading, className }: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div className={cn("absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm", className)}>
      <LoadingSpinner />
    </div>
  );
}
