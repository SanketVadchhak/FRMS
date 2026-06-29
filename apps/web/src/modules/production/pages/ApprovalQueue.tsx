/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import { useState, useMemo } from 'react';
import { Search, Factory, CheckCircle2 } from 'lucide-react';
import { PageHeader, SectionCard } from '@/components';
import { EmptyState } from '@/components/feedback/EmptyState';
import { SkeletonTable } from '@/components/feedback/SkeletonTable';
import { useProductionEntries, useBulkApproveProductionEntries } from '../hooks/useProduction';
import { useEmployees } from '@/modules/masters/employees/hooks/useEmployees';
import { useMachines } from '@/modules/masters/machines/hooks/useMachines';
import { ProductionStatus, ShiftType } from '@frms/shared';
import { ApprovalDrawer } from '../components/ApprovalDrawer';
import { QueueStatistics } from '../components/QueueStatistics';
import { StatusBadge } from '@/components/feedback/StatusBadge';
import { cn } from '@/utils/cn';

export function ApprovalQueue() {
  const { data: entries = [], isLoading } = useProductionEntries();
  const { data: employees = [] } = useEmployees();
  const { data: machines = [] } = useMachines();
  const bulkApproveMutation = useBulkApproveProductionEntries();

  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [shiftFilter, setShiftFilter] = useState<'ALL' | ShiftType>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ProductionStatus.PENDING | ProductionStatus.REJECTED>('ALL');
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  // Sort newest first (by date + createdAt)
  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => {
      const dateA = a.createdAt ?? a.date;
      const dateB = b.createdAt ?? b.date;
      return dateB.localeCompare(dateA);
    });
  }, [entries]);

  const filteredEntries = useMemo(() => {
    return sortedEntries.filter((entry) => {
      const employee = employees.find((e) => e.id === entry.employeeId);
      const machine = machines.find((m) => m.id === entry.machineId);
      const matchesSearch =
        !search ||
        employee?.name.toLowerCase().includes(search.toLowerCase()) ||
        machine?.name.toLowerCase().includes(search.toLowerCase());
      const matchesDate = !dateFilter || entry.date === dateFilter;
      const matchesShift = shiftFilter === 'ALL' || entry.shift === shiftFilter;
      const matchesStatus = statusFilter === 'ALL' 
        ? (entry.status === ProductionStatus.PENDING || entry.status === ProductionStatus.REJECTED)
        : entry.status === statusFilter;
      return matchesSearch && matchesDate && matchesShift && matchesStatus;
    });
  }, [sortedEntries, employees, machines, search, dateFilter, shiftFilter, statusFilter]);

  const toggleRow = (id: string) => {
    const next = new Set(selectedRows);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedRows(next);
  };

  const toggleAll = () => {
    if (selectedRows.size === filteredEntries.filter(e => e.status === ProductionStatus.PENDING).length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredEntries.filter(e => e.status === ProductionStatus.PENDING).map(e => e.id!)));
    }
  };

  const handleBulkApprove = () => {
    bulkApproveMutation.mutate(Array.from(selectedRows), {
      onSuccess: () => {
        setSelectedRows(new Set());
      }
    });
  };

  const selectedCount = selectedRows.size;

  return (
    <div className="space-y-6 pb-24 relative">
      <PageHeader
        title="Approval Queue"
        description="Review and manage pending factory production"
      />

      <QueueStatistics />

      {/* ── Filters ── */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Status Chips */}
          {(['ALL', ProductionStatus.PENDING, ProductionStatus.REJECTED] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-colors border",
                statusFilter === s 
                  ? "bg-primary text-primary-foreground border-primary" 
                  : "bg-background text-muted-foreground hover:bg-muted"
              )}
            >
              {s === 'ALL' ? 'All Queue' : s === ProductionStatus.PENDING ? 'Pending' : 'Rejected'}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
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
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
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
      </div>

      {/* ── Table & Mobile Cards ── */}
      <SectionCard className="overflow-hidden p-0 relative">
        {isLoading ? (
          <div className="p-4">
            <SkeletonTable columns={9} rows={5} />
          </div>
        ) : filteredEntries.length === 0 ? (
          <EmptyState
            icon={<Factory className="h-8 w-8 text-muted-foreground" />}
            title="Everything has been reviewed."
            description="No pending approvals match your criteria."
          />
        ) : (
          <>
            {/* Mobile Cards Layout */}
            <div className="md:hidden divide-y">
              {filteredEntries.map((entry) => {
                const emp = employees.find((e) => e.id === entry.employeeId);
                const mach = machines.find((m) => m.id === entry.machineId);
                const isSelected = selectedRows.has(entry.id!);
                const canSelect = entry.status === ProductionStatus.PENDING;

                return (
                  <div key={entry.id} className="p-4 flex gap-3 hover:bg-muted/30 transition-colors">
                    {canSelect && (
                      <div className="pt-1">
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => toggleRow(entry.id!)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </div>
                    )}
                    <div 
                      className="flex-1 space-y-3 cursor-pointer"
                      onClick={() => setSelectedEntryId(entry.id!)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-sm">{emp?.name ?? entry.employeeId}</p>
                          <p className="text-xs text-muted-foreground">{mach?.name ?? entry.machineId}</p>
                        </div>
                        <StatusBadge status={entry.status} />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Qty: </span>
                          <span className="font-semibold">{entry.productionQuantity}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Hours: </span>
                          <span className="font-semibold">{entry.hoursWorked}</span>
                        </div>
                        <div className="col-span-2 text-muted-foreground truncate">
                          {entry.details?.map(d => d.designName).join(', ') || 'Unknown Design'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table Layout */}
            <table className="w-full text-sm text-left hidden md:table">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-4 py-3 w-10">
                    <input 
                      type="checkbox" 
                      onChange={toggleAll}
                      checked={selectedRows.size > 0 && selectedRows.size === filteredEntries.filter(e => e.status === ProductionStatus.PENDING).length}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Employee</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Machine</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Design</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Qty</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Hrs</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredEntries.map((entry) => {
                  const emp = employees.find((e) => e.id === entry.employeeId);
                  const mach = machines.find((m) => m.id === entry.machineId);
                  const isSelected = selectedRows.has(entry.id!);
                  const canSelect = entry.status === ProductionStatus.PENDING;

                  return (
                    <tr
                      key={entry.id}
                      className={cn(
                        "hover:bg-muted/40 transition-colors cursor-pointer",
                        isSelected && "bg-primary/5 hover:bg-primary/10"
                      )}
                    >
                      <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                        {canSelect ? (
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={() => toggleRow(entry.id!)}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                        ) : null}
                      </td>
                      <td className="px-4 py-3.5 font-medium whitespace-nowrap" onClick={() => setSelectedEntryId(entry.id!)}>
                        {new Date(entry.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </td>
                      <td className="px-4 py-3.5 font-medium" onClick={() => setSelectedEntryId(entry.id!)}>{emp?.name ?? entry.employeeId}</td>
                      <td className="px-4 py-3.5 text-muted-foreground" onClick={() => setSelectedEntryId(entry.id!)}>{mach?.name ?? entry.machineId}</td>
                      <td className="px-4 py-3.5 truncate max-w-[150px] text-muted-foreground" onClick={() => setSelectedEntryId(entry.id!)}>
                        {entry.details?.map(d => d.designName).join(', ') || '—'}
                      </td>
                      <td className="px-4 py-3.5 text-right font-semibold tabular-nums" onClick={() => setSelectedEntryId(entry.id!)}>{entry.productionQuantity}</td>
                      <td className="px-4 py-3.5 text-right tabular-nums text-muted-foreground" onClick={() => setSelectedEntryId(entry.id!)}>{entry.hoursWorked}</td>
                      <td className="px-4 py-3.5 text-center" onClick={() => setSelectedEntryId(entry.id!)}>
                        <StatusBadge status={entry.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}
      </SectionCard>

      {/* Floating Bulk Action Bar */}
      {selectedCount > 0 && (
        <div className="fixed bottom-20 md:bottom-10 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-5">
          <div className="bg-foreground text-background px-6 py-3 rounded-full shadow-2xl flex items-center gap-4">
            <span className="text-sm font-medium whitespace-nowrap">{selectedCount} selected</span>
            <div className="w-px h-4 bg-muted-foreground/30" />
            <button
              onClick={handleBulkApprove}
              disabled={bulkApproveMutation.isPending}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              <CheckCircle2 className="h-4 w-4" />
              Approve Selected
            </button>
          </div>
        </div>
      )}

      {selectedEntryId && (
        <ApprovalDrawer
          entryId={selectedEntryId}
          open={!!selectedEntryId}
          onOpenChange={(open) => !open && setSelectedEntryId(null)}
          contextEntries={filteredEntries} // Pass context for "Approve Next" functionality
        />
      )}
    </div>
  );
}
