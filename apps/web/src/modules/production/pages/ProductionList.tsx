import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, MoreVertical } from 'lucide-react';
import { PageHeader } from '@/components';
import { useProductionEntries } from '../hooks/useProduction';
import { useEmployees } from '@/modules/masters/employees/hooks/useEmployees';
import { useMachines } from '@/modules/masters/machines/hooks/useMachines';
import { ShiftType } from '@frms/shared';
import { ROUTES } from '@/constants';
import { ApprovalDrawer } from '../components/ApprovalDrawer';
import { cn } from '@/utils/cn';

export function ProductionList() {
  const navigate = useNavigate();
  const { data: entries = [], isLoading } = useProductionEntries();
  const { data: employees = [] } = useEmployees();
  const { data: machines = [] } = useMachines();

  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const [shiftFilter, setShiftFilter] = useState<string>('ALL');
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  const filteredEntries = entries.filter((entry) => {
    const employee = employees.find((e) => e.id === entry.employeeId);
    const machine = machines.find((m) => m.id === entry.machineId);
    
    const matchesSearch = 
      employee?.name.toLowerCase().includes(search.toLowerCase()) ||
      machine?.name.toLowerCase().includes(search.toLowerCase());
      
    const matchesDate = dateFilter ? entry.date === dateFilter : true;
    const matchesShift = shiftFilter !== 'ALL' ? entry.shift === shiftFilter : true;

    return matchesSearch && matchesDate && matchesShift;
  });

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Production Entry" 
        description="Daily factory production logs"
        action={
          <button
            onClick={() => navigate(ROUTES.PRODUCTION.NEW)}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            <Plus className="h-4 w-4 mr-2" /> New Entry
          </button>
        }
      />

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search employee or machine..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <input 
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <select 
            value={shiftFilter}
            onChange={(e) => setShiftFilter(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="ALL">All Shifts</option>
            <option value={ShiftType.DAY}>Day</option>
            <option value={ShiftType.NIGHT}>Night</option>
          </select>
        </div>
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="w-full">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground border-b hidden sm:table-header-group">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Employee</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Machine</th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell">Shift</th>
                <th className="px-4 py-3 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y block sm:table-row-group">
              {isLoading ? (
                <tr className="block sm:table-row">
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground block sm:table-cell">
                    Loading production entries...
                  </td>
                </tr>
              ) : filteredEntries.length === 0 ? (
                <tr className="block sm:table-row">
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground block sm:table-cell">
                    No production entries found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => {
                  const emp = employees.find(e => e.id === entry.employeeId);
                  const mach = machines.find(m => m.id === entry.machineId);
                  
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
                      className="hover:bg-muted/30 transition-colors cursor-pointer group flex flex-col sm:table-row py-3 sm:py-0 focus-visible:outline-none focus-visible:bg-muted/30"
                    >
                      {/* Mobile: Top Row */}
                      <td className="px-4 sm:py-4 font-medium flex justify-between items-center sm:table-cell">
                        <span>{new Date(entry.date).toLocaleDateString()}</span>
                        
                        {/* Mobile Only Actions */}
                        <div className="flex sm:hidden items-center gap-3">
                          <button 
                            className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                      
                      <td className="px-4 sm:py-4 text-muted-foreground sm:text-foreground">
                        {emp?.name || entry.employeeId}
                      </td>
                      
                      <td className="hidden md:table-cell px-4 py-4 text-muted-foreground">
                        {mach?.name || entry.machineId}
                      </td>
                      
                      <td className="hidden lg:table-cell px-4 py-4 text-muted-foreground">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-xs font-medium",
                          entry.shift === ShiftType.DAY ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" : "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"
                        )}>
                          {entry.shift}
                        </span>
                      </td>
                      
                      <td className="hidden sm:table-cell px-4 py-4 text-center">
                        <button 
                          className="h-8 w-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

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
