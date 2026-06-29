import { Search } from 'lucide-react';
import type { AttendanceFilters } from '@frms/shared';
import { AttendanceStatus } from '@frms/shared';

interface AttendanceFilterBarProps {
  filters: AttendanceFilters;
  onFilterChange: (filters: AttendanceFilters) => void;
  onClearFilters: () => void;
}

export function AttendanceFilterBar({ filters, onFilterChange, onClearFilters }: AttendanceFilterBarProps) {
  // Simple today string YYYY-MM-DD for default date if empty
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="flex flex-col gap-4 p-4 border-b bg-card">
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 w-full min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search employee..."
            className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={filters.employeeId || ''} // In a real app, use a searchable select for Employee ID or text search for Name
            onChange={(e) => onFilterChange({ ...filters, employeeId: e.target.value || undefined })}
          />
        </div>

        {/* Date Filter */}
        <div className="w-full sm:w-auto">
          <input
            type="date"
            value={filters.date || today}
            onChange={(e) => onFilterChange({ ...filters, date: e.target.value })}
            className="w-full sm:w-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        {/* Status Filter */}
        <div className="w-full sm:w-auto">
          <select
            value={filters.status || ''}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value as AttendanceStatus || undefined })}
            className="w-full sm:w-[130px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">All Statuses</option>
            <option value={AttendanceStatus.PRESENT}>Present</option>
            <option value={AttendanceStatus.ABSENT}>Absent</option>
          </select>
        </div>

        {/* Clear Filters */}
        {(filters.employeeId || filters.status) && (
          <button
            onClick={onClearFilters}
            className="w-full sm:w-auto px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
