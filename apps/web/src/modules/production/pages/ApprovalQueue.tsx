import { useState } from 'react';
import { Factory, CheckCircle2, XCircle } from 'lucide-react';
import { PageHeader, SectionCard, StatusBadge } from '@/components';
import { EmptyState } from '@/components/feedback/EmptyState';
import { SkeletonTable } from '@/components/feedback/SkeletonTable';
import {
  useProductionEntries,
  useBulkApproveProductionEntries,
  useApproveProductionEntry,
} from '../hooks/useProduction';
import { useEmployees } from '@/modules/masters/employees/hooks/useEmployees';
import { ProductionStatus } from '@frms/shared';
import { QueueStatistics } from '../components/QueueStatistics';
import { ProductionFilterBar } from '../components/ProductionFilterBar';
import { useFilteredProductionEntries, defaultProductionFilters, type ProductionFilters } from '../hooks/useFilteredProductionEntries';
import { useColumnPreferences } from '@/hooks/useColumnPreferences';
import { APPROVAL_QUEUE_COLUMNS } from '../constants/production-columns';
import type { TableContext } from '../constants/production-columns';
import { cn } from '@/utils/cn';
import { RejectDialog } from '../components/RejectDialog';
import { formatProductionDateTime } from '@/utils';

export function ApprovalQueue() {
  const { data: rawEntries, isLoading } = useProductionEntries();
  const { data: rawEmployees } = useEmployees();

  const entries = rawEntries || [];
  const employees = rawEmployees || [];

  const bulkApproveMutation = useBulkApproveProductionEntries();
  const approveMutation = useApproveProductionEntry();

  const [filters, setFilters] = useState<ProductionFilters>({ ...defaultProductionFilters, status: ProductionStatus.PENDING });
  
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [rejectEntryId, setRejectEntryId] = useState<string | null>(null);

  const { filteredEntries, recordCount } = useFilteredProductionEntries(entries, filters, employees);

  const columnProps = useColumnPreferences('frms_approval_columns', APPROVAL_QUEUE_COLUMNS);
  const { orderedVisibleColumns } = columnProps;

  const toggleRow = (id: string) => {
    const next = new Set(selectedRows);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedRows(next);
  };

  const toggleAll = () => {
    const pendingCount = filteredEntries.filter(e => e.status === ProductionStatus.PENDING).length;
    if (selectedRows.size === pendingCount && pendingCount > 0) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredEntries.filter(e => e.status === ProductionStatus.PENDING).map(e => e.id!)));
    }
  };

  const handleBulkApprove = () => {
    bulkApproveMutation.mutate(Array.from(selectedRows), {
      onSuccess: () => setSelectedRows(new Set())
    });
  };

  const handleApprove = (id: string) => {
    approveMutation.mutate(id);
  };

  const selectedCount = selectedRows.size;
  const pendingCount = filteredEntries.filter(e => e.status === ProductionStatus.PENDING).length;

  const totalQty = filteredEntries.reduce((acc, e) => acc + (e.productionQuantity || 0), 0);
  const totalHours = filteredEntries.reduce((acc, e) => acc + (e.hoursWorked || 0), 0);

  const tableContext: TableContext = {
    employees,
    formatDateTime: formatProductionDateTime,
    totalQty,
    totalHours,
    selectedRows,
    toggleRow,
    toggleAll,
    selectedCount: selectedRows.size,
    pendingCount,
    handleApprove,
    setRejectEntryId,
    isApproving: approveMutation.isPending,
    isApprovalQueue: true
  };

  return (
    <div className="space-y-4 flex flex-col h-[calc(100vh-80px)] pb-20">
      <div className="shrink-0 space-y-6">
        <PageHeader title="Approval Queue" description="Review and manage pending factory production" />
        <QueueStatistics />

        <div className="space-y-4">
          <ProductionFilterBar
            filters={filters}
            onChange={setFilters}
            employees={employees}
            statusOptions={[
              { value: ProductionStatus.PENDING, label: 'Pending' },
              { value: ProductionStatus.APPROVED, label: 'Approved' },
              { value: ProductionStatus.REJECTED, label: 'Rejected' },
            ]}
          />
          
          <div className="text-sm text-muted-foreground font-medium px-1">
            Showing {recordCount} of {entries.length} production entries
          </div>
        </div>
      </div>

      <SectionCard className="p-0 overflow-hidden flex flex-col flex-1 min-h-0 border border-border/50 relative">
        {isLoading ? (
          <div className="p-4">
            <SkeletonTable columns={9} rows={10} />
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="flex-1 overflow-auto">
            <EmptyState
              icon={<Factory className="h-8 w-8 text-muted-foreground" />}
              title="Everything has been reviewed."
              description="No pending approvals match your criteria."
            />
          </div>
        ) : (
          <div className="flex-1 overflow-auto relative scrollbar-thin">
            <table className="w-full text-left whitespace-nowrap border-collapse hidden md:table">
              <thead className="sticky top-0 z-30 bg-background/95 backdrop-blur shadow-sm border-b border-border/50">
                <tr>
                  {orderedVisibleColumns.map(colId => {
                    const col = APPROVAL_QUEUE_COLUMNS.find(c => c.id === colId);
                    if (!col) return null;
                    return (
                      <th 
                        key={colId} 
                        className="px-4 py-3 text-sm font-semibold text-muted-foreground border-b border-border/30 whitespace-nowrap"
                        style={{ width: col.width, minWidth: col.width, maxWidth: col.width }}
                      >
                        {col.renderHeader?.(tableContext) ?? col.label}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry) => {
                  const isSelected = selectedRows.has(entry.id!);

                  return (
                    <tr
                      key={entry.id}
                      className={cn(
                        "group transition-colors hover:bg-muted/40",
                        isSelected && "bg-primary/5 hover:bg-primary/10"
                      )}
                    >
                      {orderedVisibleColumns.map(colId => {
                        const col = APPROVAL_QUEUE_COLUMNS.find(c => c.id === colId);
                        if (!col) return null;
                        
                        const isNumber = ['qty', 'hours', 'frames', 'thread_breaks', 'bonus', 'total_stitches'].includes(colId);
                        const isCenter = ['status', 'actions', 'notes', 'checkbox'].includes(colId);

                        return (
                          <td 
                            key={colId} 
                            className={`px-4 py-3 text-sm border-b border-border/30 ${isNumber ? 'text-right tabular-nums' : isCenter ? 'text-center' : ''}`}
                          >
                            {col.render?.(entry, tableContext) ?? '—'}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Mobile Layout Fallback */}
            <div className="md:hidden divide-y">
              {filteredEntries.map((entry) => {
                const emp = employees.find((e: { id?: string; name: string }) => e.id === entry.employeeId);
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
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-sm">{emp?.name ?? entry.employeeId}</p>
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
                      {entry.status === ProductionStatus.PENDING && (
                        <div className="flex items-center gap-2 pt-2 border-t mt-2">
                          <button 
                            onClick={() => handleApprove(entry.id!)}
                            disabled={approveMutation.isPending}
                            className="flex-1 inline-flex items-center justify-center gap-2 h-8 rounded border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-medium transition-colors"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Approve
                          </button>
                          <button 
                            onClick={() => setRejectEntryId(entry.id!)}
                            className="flex-1 inline-flex items-center justify-center gap-2 h-8 rounded border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium transition-colors"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
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

      <RejectDialog 
        entryId={rejectEntryId} 
        onClose={() => setRejectEntryId(null)} 
      />
    </div>
  );
}
