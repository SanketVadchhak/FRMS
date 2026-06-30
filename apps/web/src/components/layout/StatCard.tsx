import { cn } from '@/utils/cn';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number | string;
    label: string;
    isPositive?: boolean;
    showPlus?: boolean;
  };
  className?: string;
}

export function StatCard({ title, value, description, icon, trend, className }: StatCardProps) {
  return (
    <div className={cn("rounded-xl border bg-card text-card-foreground shadow-sm p-6", className)}>
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="tracking-tight text-sm font-medium">{title}</h3>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        {trend && (
          <p className="text-xs text-muted-foreground mt-1">
            <span className={cn(
              "font-medium mr-1",
              trend.isPositive === true ? "text-emerald-500" : 
              trend.isPositive === false ? "text-destructive" : ""
            )}>
              {trend.showPlus && trend.isPositive ? '+' : ''}{trend.value}
            </span>
            {trend.label}
          </p>
        )}
      </div>
    </div>
  );
}
