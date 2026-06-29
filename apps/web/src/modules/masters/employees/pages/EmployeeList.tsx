import { useState } from 'react';
import { 
  useEmployees, 
  useCreateEmployee, 
  useUpdateEmployee, 
  useChangeEmployeeStatus 
} from '../hooks/useEmployees';
import { EmployeeForm } from '../components/EmployeeForm';
import { AttendanceCalendarDialog } from '../components/AttendanceCalendarDialog';
import type { Employee, EmployeeFormValues } from '@frms/shared';
import * as Dialog from '@radix-ui/react-dialog';
import { Plus, Search, Users } from 'lucide-react';
import { cn } from '@/utils/cn';
import { PageHeader } from '@/components';
import { SkeletonTable, EmptyState } from '@/components/feedback';
import { useColumnPreferences } from '@/hooks/useColumnPreferences';
import { EMPLOYEE_COLUMNS } from '@/config/table-columns/employee-columns';


export function EmployeeList() {
  const { data: employees, isLoading } = useEmployees();
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const changeStatus = useChangeEmployeeStatus();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ACTIVE');
  
  const { orderedVisibleColumns } = useColumnPreferences('frms_employee_columns', EMPLOYEE_COLUMNS);

  // Create / Edit Form Dialog
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | undefined>();

  // Attendance Calendar Dialog
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarEmployee, setCalendarEmployee] = useState<Employee | null>(null);

  const filteredEmployees = employees?.filter((emp) => {
    const matchesSearch = emp.name.toLowerCase().includes(search.toLowerCase()) || 
                          emp.mobile.includes(search);
    const matchesFilter = filter === 'ALL' || emp.status === filter;
    return matchesSearch && matchesFilter;
  }) || [];

  const handleOpenCreate = () => {
    setEditingEmployee(undefined);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsFormOpen(true);
  };

  const handleOpenCalendar = (employee: Employee) => {
    setCalendarEmployee(employee);
    setIsCalendarOpen(true);
  };

  const handleSubmit = (data: EmployeeFormValues) => {
    if (editingEmployee) {
      updateEmployee.mutate(
        { id: editingEmployee.id!, data },
        { 
          onSuccess: () => {
            setIsFormOpen(false);
          }
        }
      );
    } else {
      createEmployee.mutate(data, { onSuccess: () => setIsFormOpen(false) });
    }
  };

  const handleToggleStatus = (employee: Employee) => {
    const newStatus = employee.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    changeStatus.mutate({ id: employee.id!, status: newStatus });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Employees"
        description="Manage factory workers and their details."
        action={
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Employee
          </button>
        }
      />

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or mobile..."
            className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex bg-muted/50 p-1 rounded-lg w-full sm:w-auto">
          {(['ACTIVE', 'INACTIVE', 'ALL'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                filter === f ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table Optimized for Desktop/ERP (Horizontal Scroll) */}
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden flex flex-col flex-1">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm text-left relative">
            <thead className="bg-muted/50 text-muted-foreground border-b sticky top-0 z-20">
              <tr>
                {orderedVisibleColumns.map((colId: string) => {
                  const col = EMPLOYEE_COLUMNS.find((c) => c.id === colId);
                  if (!col) return null;
                  const isActions = colId === 'actions';
                  const isAttendance = colId === 'attendance';
                  return (
                    <th 
                      key={colId} 
                      className={`px-4 py-3 font-medium whitespace-nowrap ${isActions || isAttendance ? 'text-center' : ''}`}
                    >
                      {col.label}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr>
                  <td colSpan={orderedVisibleColumns.length} className="px-0 py-0">
                    <div className="p-4">
                      <SkeletonTable columns={orderedVisibleColumns.length} rows={5} />
                    </div>
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={orderedVisibleColumns.length} className="px-0 py-0">
                    <EmptyState 
                      icon={<Users className="h-8 w-8 text-muted-foreground" />}
                      title="No employees found"
                      description={search || filter !== 'ALL' ? "Try adjusting your search or filter criteria." : "Get started by adding a new employee."}
                    />
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr 
                    key={emp.id} 
                    className="hover:bg-muted/30 transition-colors group focus-visible:outline-none focus-visible:bg-muted/30"
                  >
                    {orderedVisibleColumns.map((colId: string) => {
                      const col = EMPLOYEE_COLUMNS.find((c) => c.id === colId);
                      if (!col) return null;
                      
                      const isCenter = ['status', 'actions', 'attendance'].includes(colId);

                      return (
                        <td 
                          key={colId} 
                          className={`px-4 py-3 text-sm border-b border-border/30 ${isCenter ? 'text-center' : ''}`}
                        >
                          {col.render?.(emp, { handleOpenEdit, handleToggleStatus, handleOpenCalendar }) ?? '—'}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog.Root open={isFormOpen} onOpenChange={setIsFormOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-in fade-in" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] bg-background p-6 shadow-lg duration-200 sm:rounded-xl animate-in zoom-in-95 border">
            <Dialog.Title className="text-lg font-semibold mb-4 tracking-tight">
              {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
            </Dialog.Title>
            <EmployeeForm 
              initialData={editingEmployee} 
              onSubmit={handleSubmit}
              onCancel={() => setIsFormOpen(false)}
            />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <AttendanceCalendarDialog 
        employee={calendarEmployee}
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
      />
    </div>
  );
}
