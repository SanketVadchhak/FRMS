import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, ChevronRight, X } from 'lucide-react';
import { PageHeader, SectionCard } from '@/components';
import { EmptyState } from '@/components/feedback/EmptyState';
import { SkeletonTable } from '@/components/feedback/SkeletonTable';
import { useProductionEntries } from '../hooks/useProduction';
import { useEmployees } from '@/modules/masters/employees/hooks/useEmployees';
import { useMachines } from '@/modules/masters/machines/hooks/useMachines';
import { ShiftType } from '@frms/shared';
import { ROUTES } from '@/constants';
import { ApprovalDrawer } from '../components/ApprovalDrawer';
import { cn } from '@/utils/cn';
import { Factory } from 'lucide-react';

export function ProductionList() {
  const navigate = useNavigate();
  const { data: entries = [], isLoading } = useProductionEntries();
  const { data: employees = [] } = useEmployees();
  const { data: machines = [] } = useMachines();

  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [shiftFilter, setShiftFilter] = useState<'ALL' | ShiftType>('ALL');
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  // Sort newest first (by date + createdAt)
  const sortedEntries = [...entries].sort((a, b) => {
    const dateA = a.createdAt ?? a.date;
    const dateB = b.createdAt ?? b.date;
    return dateB.localeCompare(dateA);
  });

  const filteredEntries = sortedEntries.filter((entry) => {
    const employee = employees.find((e) => e.id === entry.employeeId);
    const machine = machines.find((m) => m.id === entry.machineId);
    const matchesSearch =
      !search ||
      employee?.name.toLowerCase().includes(search.toLowerCase()) ||
      machine?.name.toLowerCase().includes(search.toLowerCase());
    const matchesDate = !dateFilter || entry.date === dateFilter;
    const matchesShift = shiftFilter === 'ALL' || entry.shift === shiftFilter;
    return matchesSearch && matchesDate && matchesShift;
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Production"
        description="Daily factory production logs"
        action={
          <button
            onClick={() => navigate(ROUTES.PRODUCTION.NEW)}
            className="inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4"
          >
            <Plus className="h-4 w-4" />
            New Entry
          </button>
        }
      />

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search by employee or machine…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Date filter with clear button */}
        <div className="relative flex items-center">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring pr-8"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear date filter"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Shift filter */}
        <select
          value={shiftFilter}
          onChange={(e) => setShiftFilter(e.target.value as 'ALL' | ShiftType)}
          className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="ALL">All Shifts</option>
          <option value={ShiftType.DAY}>Day Shift</option>
          <option value={ShiftType.NIGHT}>Night Shift</option>
        </select>
      </div>

      {/* ── Table ── */}
      <SectionCard className="overflow-hidden p-0">
        {isLoading ? (
          <div className="p-4">
            <SkeletonTable columns={4} rows={5} />
          </div>
        ) : filteredEntries.length === 0 ? (
          <EmptyState
            icon={<Factory className="h-8 w-8 text-muted-foreground" />}
            title={search || dateFilter || shiftFilter !== 'ALL'
              ? 'No entries match your filters'
              : 'No production entries yet'}
            description={
              search || dateFilter || shiftFilter !== 'ALL'
                ? 'Try adjusting your search or filter criteria.'
                : 'Create the first production entry to get started.'
            }
            action={
              !search && !dateFilter && shiftFilter === 'ALL' ? (
                <button
                  onClick={() => navigate(ROUTES.PRODUCTION.NEW)}
                  className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  New Entry
                </button>
              ) : undefined
            }
          />
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Date
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Employee
                </th>
                <th className="hidden md:table-cell px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Machine
                </th>
                <th className="hidden lg:table-cell px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Shift
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">
                  Qty
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredEntries.map((entry) => {
                const emp = employees.find((e) => e.id === entry.employeeId);
                const mach = machines.find((m) => m.id === entry.machineId);

                return (
                  <tr
                    key={entry.id}
                    onClick={() => setSelectedEntryId(entry.id!)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedEntryId(entry.id!);
                      }
                    }}
                    tabIndex={0}
                    className="hover:bg-muted/40 transition-colors cursor-pointer focus-visible:outline-none focus-visible:bg-muted/40"
                  >
                    <td className="px-4 py-3.5 font-medium whitespace-nowrap">
                      {new Date(entry.date + 'T00:00:00').toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-medium">{emp?.name ?? entry.employeeId}</span>
                    </td>
                    <td className="hidden md:table-cell px-4 py-3.5 text-muted-foreground">
                      {mach?.name ?? entry.machineId}
                    </td>
                    <td className="hidden lg:table-cell px-4 py-3.5">
                      <span
                        className={cn(
                          'inline-block px-2 py-0.5 rounded text-xs font-medium',
                          entry.shift === ShiftType.DAY
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                            : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
                        )}
                      >
                        {entry.shift === ShiftType.DAY ? 'Day' : 'Night'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-semibold tabular-nums">
                      <div className="flex items-center justify-end gap-2">
                        <span>{entry.productionQuantity}</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </SectionCard>

      {selectedEntryId && (
        <ApprovalDrawer
          entryId={selectedEntryId}
          open={!!selectedEntryId}
          onOpenChange={(open) => !open && setSelectedEntryId(null)}
        />
      )}
    </div>
  );
}
