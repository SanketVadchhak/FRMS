import { cn } from '@/utils/cn';

interface SectionCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export function SectionCard({ title, description, children, action, className }: SectionCardProps) {
  return (
    <div className={cn("rounded-xl border bg-card text-card-foreground shadow-sm", className)}>
      {(title || description || action) && (
        <div className="flex flex-col space-y-1.5 p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              {title && <h3 className="font-semibold leading-none tracking-tight">{title}</h3>}
              {description && <p className="text-sm text-muted-foreground mt-1.5">{description}</p>}
            </div>
            {action && <div>{action}</div>}
          </div>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}
