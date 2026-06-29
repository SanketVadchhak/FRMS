import { cn } from '@/utils/cn';
import { ProductionStatus } from '@frms/shared';

// Support both specific ProductionStatus and general ACTIVE/INACTIVE statuses
type StatusType = ProductionStatus | 'ACTIVE' | 'INACTIVE' | 'ALL' | string;

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  let badgeClass = 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-300';
  let label = status;

  switch (status) {
    // General Entity Statuses
    case 'ACTIVE':
      badgeClass = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      break;
    case 'INACTIVE':
      badgeClass = 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-300';
      break;
      
    // Production Statuses
    case ProductionStatus.DRAFT:
      badgeClass = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
      label = 'Draft';
      break;
    case ProductionStatus.PENDING:
      badgeClass = 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      label = 'Pending Review';
      break;
    case ProductionStatus.APPROVED:
      badgeClass = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      label = 'Approved';
      break;
    case ProductionStatus.REJECTED:
      badgeClass = 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      label = 'Rejected';
      break;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
        badgeClass,
        className
      )}
    >
      {label}
    </span>
  );
}
