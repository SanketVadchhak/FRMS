import { useState } from 'react';
import { PageHeader, SectionCard, SkeletonTable, ErrorState, EmptyState } from '@/components';
import { StatusBadge } from '@/components/feedback';
import { useAttendanceRecords } from '../hooks/useAttendance';
import { AttendanceFilterBar } from '../components/AttendanceFilterBar';
import { useColumnPreferences } from '@/hooks/useColumnPreferences';
import { TABLE_REGISTRY } from '@/config/table-registry';
import type { AttendanceFilters, AttendanceRecord } from '@frms/shared';
import { formatDate } from '@/utils';
import { Clock } from 'lucide-react';

export function AttendanceRegister() {
  const today = new Date().toISOString().split('T')[0];
  
  const [filters, setFilters] = useState<AttendanceFilters>({
    date: today,
  });

  const { data: records, isLoading, isError, refetch } = useAttendanceRecords(filters);

  // Column preferences
  const registryEntry = TABLE_REGISTRY.find(t => t.storageKey === 'frms_attendance_columns')!;
  const { orderedVisibleColumns } = useColumnPreferences(
    registryEntry.storageKey,
    registryEntry.columns
  );

  // Map IDs to actual column objects for rendering
  const orderedColumns = orderedVisibleColumns
    .map(id => registryEntry.columns.find(c => c.id === id))
    .filter(c => c !== undefined);

  const handleClearFilters = () => {
    setFilters({ date: today });
  };

  const renderCell = (colId: string, record: AttendanceRecord) => {
    switch (colId) {
      case 'date':
        return formatDate(record.date);
      case 'employee':
        return <span className="font-medium text-foreground">{record.employeeName}</span>;
      case 'status':
        return (
          <StatusBadge 
            status={record.status} 
          />
        );
      case 'totalWorkingHours':
        return record.totalWorkingHours > 0 ? `${record.totalWorkingHours.toFixed(1)} hrs` : '-';
      case 'totalQuantity':
        return record.totalQuantity > 0 ? record.totalQuantity.toLocaleString() : '-';
      case 'totalEntries':
        return record.totalEntries > 0 ? record.totalEntries : '-';
      default:
        return '-';
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      <PageHeader 
        title="Attendance Register" 
        description="Auto-generated attendance based on daily production entries"
      />

      <SectionCard className="p-0 flex flex-col flex-1 overflow-hidden min-h-[500px]">
        <AttendanceFilterBar 
          filters={filters}
          onFilterChange={setFilters}
          onClearFilters={handleClearFilters}
        />

        <div className="flex-1 overflow-auto relative w-full">
          {isLoading ? (
            <div className="p-4">
              <SkeletonTable columns={orderedColumns.length} rows={10} />
            </div>
          ) : isError ? (
            <div className="p-12">
              <ErrorState onRetry={() => refetch()} />
            </div>
          ) : records && records.length > 0 ? (
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground sticky top-0 z-10 shadow-sm border-b">
                <tr>
                  {orderedColumns.map((col) => col && (
                    <th key={col.id} className="px-4 py-3 font-medium whitespace-nowrap">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-muted/30 transition-colors">
                    {orderedColumns.map((col) => col && (
                      <td key={col.id} className="px-4 py-2.5 whitespace-nowrap align-middle">
                        {renderCell(col.id, record)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="h-full flex items-center justify-center p-12">
              <EmptyState 
                icon={<Clock className="h-10 w-10 text-muted-foreground" />}
                title="No attendance records found" 
                description="No records exist for the selected filters. Change the date or clear filters to see more results."
              />
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
