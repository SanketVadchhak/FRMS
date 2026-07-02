import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { SectionCard } from '@/components/layout/SectionCard';
import { EmptyState } from '@/components/feedback/EmptyState';
import { SkeletonTable } from '@/components/feedback/SkeletonTable';
import { useProductionEntries } from '../hooks/useProduction';
import { useEmployees } from '@/modules/masters/employees/hooks/useEmployees';
import { ProductionStatus } from '@frms/shared';
import { ProductionFilterBar } from '../components/ProductionFilterBar';
import { useFilteredProductionEntries, defaultProductionFilters, type ProductionFilters } from '../hooks/useFilteredProductionEntries';
import { useColumnPreferences } from '@/hooks/useColumnPreferences';
import { PRODUCTION_LIST_COLUMNS } from '../constants/production-columns';
import type { TableContext } from '../constants/production-columns';
import { ROUTES } from '@/constants';
import { Factory } from 'lucide-react';
import { formatProductionDateTime } from '@/utils';

export function ProductionList() {
  const navigate = useNavigate();
  const { data: rawEntries, isLoading } = useProductionEntries();
  const { data: rawEmployees } = useEmployees();

  const entries = rawEntries || [];
  const employees = rawEmployees || [];

  const location = useLocation();
  const [filters, setFilters] = useState<ProductionFilters>(() => ({
    ...defaultProductionFilters,
    search: location.state?.search || defaultProductionFilters.search
  }));

  useEffect(() => {
    if (location.state?.search) {
      // Optional: Clear state so refresh doesn't keep searching
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const { filteredEntries, recordCount } = useFilteredProductionEntries(entries, filters, employees);
  
  const columnProps = useColumnPreferences('frms_production_columns', PRODUCTION_LIST_COLUMNS);
  const { orderedVisibleColumns } = columnProps;

  const totalQty = filteredEntries.reduce((acc, e) => acc + (e.productionQuantity || 0), 0);
  const totalHours = filteredEntries.reduce((acc, e) => acc + (e.hoursWorked || 0), 0);

  const tableContext: TableContext = {
    employees,
    formatDateTime: formatProductionDateTime,
    totalQty,
    totalHours,
    navigate
  };

  return (
    <div className="space-y-4 flex flex-col h-[calc(100vh-80px)]">
      <PageHeader
        title="Production"
        description="Daily factory production logs"
        action={
          <button
            onClick={() => navigate(ROUTES.PRODUCTION.NEW)}
            className="inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 shrink-0"
          >
            <Plus className="h-4 w-4" />
            New Entry
          </button>
        }
      />

      <div className="shrink-0 space-y-4">
        <ProductionFilterBar
          filters={filters}
          onChange={setFilters}
          employees={employees}
          statusOptions={[
            { value: 'ALL', label: 'All Status' },
            { value: ProductionStatus.DRAFT, label: 'Draft' },
            { value: ProductionStatus.PENDING, label: 'Pending' },
            { value: ProductionStatus.APPROVED, label: 'Approved' },
            { value: ProductionStatus.REJECTED, label: 'Rejected' },
          ]}
        />
        
        <div className="text-sm text-muted-foreground font-medium px-1">
          Showing {recordCount} of {entries.length} production entries
        </div>
      </div>

      {/* ── Dense Table ── */}
      <SectionCard className="p-0 overflow-hidden flex flex-col flex-1 min-h-0 border border-border/50">
        {isLoading ? (
          <div className="p-4">
            <SkeletonTable columns={8} rows={10} />
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="flex-1 overflow-auto">
            <EmptyState
              icon={<Factory className="h-8 w-8 text-muted-foreground" />}
              title="No entries match your filters"
              description="Try adjusting your search or filter criteria."
            />
          </div>
        ) : (
          <div className="flex-1 overflow-auto relative scrollbar-thin">
            <table className="w-full text-left whitespace-nowrap border-collapse">
              <thead className="sticky top-0 z-30 bg-background/95 backdrop-blur shadow-sm border-b border-border/50">
                <tr>
                  {orderedVisibleColumns.map(colId => {
                    const col = PRODUCTION_LIST_COLUMNS.find(c => c.id === colId);
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
                {filteredEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="group transition-colors hover:bg-muted/40"
                  >
                    {orderedVisibleColumns.map(colId => {
                      const col = PRODUCTION_LIST_COLUMNS.find(c => c.id === colId);
                      if (!col) return null;
                      
                      const isNumber = ['qty', 'hours', 'frames', 'thread_breaks', 'bonus', 'total_stitches'].includes(colId);
                      const isCenter = ['status', 'actions', 'notes'].includes(colId);

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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
