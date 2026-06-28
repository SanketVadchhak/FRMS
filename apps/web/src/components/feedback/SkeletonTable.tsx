import { cn } from '@/utils/cn';

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function SkeletonTable({ rows = 5, columns = 4, className }: SkeletonTableProps) {
  return (
    <div className={cn("w-full overflow-auto", className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b transition-colors">
            {Array.from({ length: columns }).map((_, i) => (
              <th key={`th-${i}`} className="h-12 px-4 text-left align-middle font-medium">
                <div className="h-4 w-20 animate-pulse rounded bg-muted"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={`tr-${rowIndex}`} className="border-b transition-colors">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={`td-${rowIndex}-${colIndex}`} className="p-4 align-middle">
                  <div className="h-4 w-full max-w-[120px] animate-pulse rounded bg-muted"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
