import { useState } from 'react';
import { Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/utils/cn';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import type { Employee } from '@frms/shared';
import type { ProductionFilters } from '../hooks/useFilteredProductionEntries';
import { defaultProductionFilters } from '../hooks/useFilteredProductionEntries';

export interface ProductionFilterBarProps {
  filters: ProductionFilters;
  onChange: (filters: ProductionFilters) => void;
  employees: Employee[];
  statusOptions: { value: string; label: string }[];
}

export function ProductionFilterBar({
  filters,
  onChange,
  employees,
  statusOptions,
}: ProductionFilterBarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const employeeOptions = [
    { value: 'ALL', label: 'All Employees' },
    ...employees.map(e => ({ value: e.id!, label: e.name }))
  ];
  
  const updateFilter = (key: keyof ProductionFilters, value: string | boolean) => {
    onChange({ ...filters, [key]: value });
  };

  const removeFilter = (key: keyof ProductionFilters) => {
    onChange({ ...filters, [key]: defaultProductionFilters[key] });
  };

  const clearAll = () => {
    onChange({ ...defaultProductionFilters, status: statusOptions[0]?.value || 'ALL' });
  };

  const hasActiveFilters = Object.keys(filters).some(
    (k) => {
      const key = k as keyof ProductionFilters;
      if (key === 'status') {
        // Special logic for status: is it different from the default provided option?
        return filters.status !== statusOptions[0]?.value && filters.status !== 'ALL';
      }
      return filters[key] !== defaultProductionFilters[key];
    }
  );

  return (
    <div className="space-y-4">
      {/* Primary Toolbar */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search employee, machine, design..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Date Range */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={filters.fromDate}
            onChange={(e) => updateFilter('fromDate', e.target.value)}
            title="From Date"
            className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <span className="text-muted-foreground text-sm">to</span>
          <input
            type="date"
            value={filters.toDate}
            onChange={(e) => updateFilter('toDate', e.target.value)}
            title="To Date"
            className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Employee */}
        <div className="w-[180px]">
          <SearchableSelect
            options={employeeOptions}
            value={filters.employeeId}
            onChange={(v) => updateFilter('employeeId', v)}
            placeholder="All Employees"
            searchPlaceholder="Search employee..."
          />
        </div>

        {/* Status */}
        <select
          value={filters.status}
          onChange={(e) => updateFilter('status', e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={cn(
              "inline-flex items-center justify-center gap-2 h-10 px-4 rounded-md border text-sm font-medium transition-colors",
              showAdvanced ? "bg-muted text-foreground" : "bg-background text-muted-foreground hover:bg-muted"
            )}
          >
            <Filter className="h-4 w-4" />
            Advanced
            {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          <button
            onClick={clearAll}
            disabled={!hasActiveFilters}
            className="inline-flex items-center justify-center h-10 px-4 rounded-md border border-input bg-background text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50 disabled:pointer-events-none"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="p-4 border rounded-lg bg-muted/20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quantity</div>
            <div className="flex items-center gap-2">
              <input type="number" placeholder="Min Qty" aria-label="Minimum Quantity" value={filters.minQty} onChange={(e) => updateFilter('minQty', e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" />
              <input type="number" placeholder="Max Qty" aria-label="Maximum Quantity" value={filters.maxQty} onChange={(e) => updateFilter('maxQty', e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Hours Worked</div>
            <div className="flex items-center gap-2">
              <input type="number" step="0.5" placeholder="Min Hours" aria-label="Minimum Hours" value={filters.minHours} onChange={(e) => updateFilter('minHours', e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" />
              <input type="number" step="0.5" placeholder="Max Hours" aria-label="Maximum Hours" value={filters.maxHours} onChange={(e) => updateFilter('maxHours', e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bonus (₹)</div>
            <div className="flex items-center gap-2">
              <input type="number" placeholder="Min Bonus" aria-label="Minimum Bonus" value={filters.minBonus} onChange={(e) => updateFilter('minBonus', e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" />
              <input type="number" placeholder="Max Bonus" aria-label="Maximum Bonus" value={filters.maxBonus} onChange={(e) => updateFilter('maxBonus', e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="submittedBy" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Submitted By</label>
            <input id="submittedBy" type="text" placeholder="Username..." value={filters.submittedBy === 'ALL' ? '' : filters.submittedBy} onChange={(e) => updateFilter('submittedBy', e.target.value || 'ALL')} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" />
          </div>

          <div className="space-y-2">
            <label htmlFor="approvedBy" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Approved By</label>
            <input id="approvedBy" type="text" placeholder="Username..." value={filters.approvedBy === 'ALL' ? '' : filters.approvedBy} onChange={(e) => updateFilter('approvedBy', e.target.value || 'ALL')} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" />
          </div>

          <div className="space-y-2 md:col-span-3 flex items-end gap-6 pb-1.5">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={filters.hasNotes} onChange={(e) => updateFilter('hasNotes', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
              Only entries with notes
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={filters.previouslyRejected} onChange={(e) => updateFilter('previouslyRejected', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
              Previously rejected
            </label>
          </div>
        </div>
      )}

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-1">
          {filters.search && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              Search: {filters.search} <button onClick={() => removeFilter('search')} className="hover:bg-primary/20 rounded-full p-0.5"><X className="h-3 w-3" /></button>
            </span>
          )}
          {filters.fromDate && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              From: {filters.fromDate} <button onClick={() => removeFilter('fromDate')} className="hover:bg-primary/20 rounded-full p-0.5"><X className="h-3 w-3" /></button>
            </span>
          )}
          {filters.toDate && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              To: {filters.toDate} <button onClick={() => removeFilter('toDate')} className="hover:bg-primary/20 rounded-full p-0.5"><X className="h-3 w-3" /></button>
            </span>
          )}
          {filters.employeeId !== 'ALL' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              Employee: {employees.find(e => e.id === filters.employeeId)?.name || filters.employeeId} <button onClick={() => removeFilter('employeeId')} className="hover:bg-primary/20 rounded-full p-0.5"><X className="h-3 w-3" /></button>
            </span>
          )}
          {filters.status !== 'ALL' && filters.status !== statusOptions[0]?.value && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              Status: {statusOptions.find(o => o.value === filters.status)?.label || filters.status} <button onClick={() => removeFilter('status')} className="hover:bg-primary/20 rounded-full p-0.5"><X className="h-3 w-3" /></button>
            </span>
          )}
          {(filters.minQty || filters.maxQty) && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              Qty: {filters.minQty || '0'} to {filters.maxQty || '∞'} <button onClick={() => { removeFilter('minQty'); removeFilter('maxQty'); }} className="hover:bg-primary/20 rounded-full p-0.5"><X className="h-3 w-3" /></button>
            </span>
          )}
          {(filters.minHours || filters.maxHours) && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              Hours: {filters.minHours || '0'} to {filters.maxHours || '∞'} <button onClick={() => { removeFilter('minHours'); removeFilter('maxHours'); }} className="hover:bg-primary/20 rounded-full p-0.5"><X className="h-3 w-3" /></button>
            </span>
          )}
          {(filters.minBonus || filters.maxBonus) && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              Bonus: ₹{filters.minBonus || '0'} to ₹{filters.maxBonus || '∞'} <button onClick={() => { removeFilter('minBonus'); removeFilter('maxBonus'); }} className="hover:bg-primary/20 rounded-full p-0.5"><X className="h-3 w-3" /></button>
            </span>
          )}
          {filters.submittedBy !== 'ALL' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              Submitted: {filters.submittedBy} <button onClick={() => removeFilter('submittedBy')} className="hover:bg-primary/20 rounded-full p-0.5"><X className="h-3 w-3" /></button>
            </span>
          )}
          {filters.approvedBy !== 'ALL' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              Approved: {filters.approvedBy} <button onClick={() => removeFilter('approvedBy')} className="hover:bg-primary/20 rounded-full p-0.5"><X className="h-3 w-3" /></button>
            </span>
          )}
          {filters.hasNotes && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              Has Notes <button onClick={() => removeFilter('hasNotes')} className="hover:bg-primary/20 rounded-full p-0.5"><X className="h-3 w-3" /></button>
            </span>
          )}
          {filters.previouslyRejected && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              Previously Rejected <button onClick={() => removeFilter('previouslyRejected')} className="hover:bg-primary/20 rounded-full p-0.5"><X className="h-3 w-3" /></button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
