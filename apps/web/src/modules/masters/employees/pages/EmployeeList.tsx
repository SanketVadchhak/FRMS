import { useState } from 'react';
import { 
  useEmployees, 
  useCreateEmployee, 
  useUpdateEmployee, 
  useChangeEmployeeStatus 
} from '../hooks/useEmployees';
import { EmployeeForm } from '../components/EmployeeForm';
import type { Employee, EmployeeFormValues } from '@frms/shared';
import * as Dialog from '@radix-ui/react-dialog';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { MoreVertical, Plus, Search, Edit2, CheckCircle, XCircle, X, Users } from 'lucide-react';
import { cn } from '@/utils/cn';
import { PageHeader } from '@/components';
import { StatusBadge, SkeletonTable, EmptyState } from '@/components/feedback';


export function EmployeeList() {
  const { data: employees, isLoading } = useEmployees();
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const changeStatus = useChangeEmployeeStatus();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ACTIVE');
  
  // Create / Edit Form Dialog
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | undefined>();

  // View Details Slide-over
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | undefined>();

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
    setIsDetailsOpen(false); // Close details if open
    setIsFormOpen(true);
  };

  const handleViewDetails = (employee: Employee) => {
    setViewingEmployee(employee);
    setIsDetailsOpen(true);
  };

  const handleSubmit = (data: EmployeeFormValues) => {
    if (editingEmployee) {
      updateEmployee.mutate(
        { id: editingEmployee.id!, data },
        { 
          onSuccess: () => {
            setIsFormOpen(false);
            // Update viewing employee data if details is still open behind it or reopened
            if (viewingEmployee?.id === editingEmployee.id) {
              setViewingEmployee({ ...viewingEmployee, ...data } as Employee);
            }
          }
        }
      );
    } else {
      createEmployee.mutate(data, { onSuccess: () => setIsFormOpen(false) });
    }
  };

  const handleToggleStatus = (employee: Employee) => {
    const newStatus = employee.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    changeStatus.mutate(
      { id: employee.id!, status: newStatus },
      {
        onSuccess: () => {
          if (viewingEmployee?.id === employee.id) {
            setViewingEmployee({ ...employee, status: newStatus });
          }
        }
      }
    );
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

      {/* Table Optimized for Mobile (No Horizontal Scroll) */}
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="w-full">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground border-b hidden sm:table-header-group">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Mobile</th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell">Rate / Hr</th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell">Joined</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y block sm:table-row-group">
              {isLoading ? (
                <tr className="block sm:table-row">
                  <td colSpan={6} className="px-0 py-0 block sm:table-cell">
                    <div className="p-4">
                      <SkeletonTable columns={6} rows={5} />
                    </div>
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr className="block sm:table-row">
                  <td colSpan={6} className="px-0 py-0 block sm:table-cell">
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
                    onClick={() => handleViewDetails(emp)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleViewDetails(emp);
                      }
                    }}
                    tabIndex={0}
                    className="hover:bg-muted/30 transition-colors cursor-pointer group flex flex-col sm:table-row py-3 sm:py-0 focus-visible:outline-none focus-visible:bg-muted/30"
                  >
                    {/* Mobile: Name & Mobile stack, Desktop: Table cell */}
                    <td className="px-4 sm:py-4 font-medium flex justify-between items-center sm:table-cell">
                      <span>{emp.name}</span>
                      
                      {/* Mobile Only: 3-dot menu and status in header row */}
                      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
                      <div className="flex sm:hidden items-center gap-3" onClick={(e) => e.stopPropagation()}>
                        <StatusBadge status={emp.status} />
                        
                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger asChild>
                            <button 
                              className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                              aria-label="Employee actions"
                              title="Actions"
                            >
                              <MoreVertical className="h-[18px] w-[18px]" />
                            </button>
                          </DropdownMenu.Trigger>
                          <DropdownMenu.Portal>
                            <DropdownMenu.Content align="end" className="z-50 min-w-[160px] bg-popover text-popover-foreground rounded-md border shadow-md p-1 animate-in fade-in-80 zoom-in-95">
                              <DropdownMenu.Item 
                                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                onClick={() => handleOpenEdit(emp)}
                              >
                                <Edit2 className="mr-2 h-4 w-4" /> Edit Details
                              </DropdownMenu.Item>
                              <DropdownMenu.Separator className="-mx-1 my-1 h-px bg-muted" />
                              <DropdownMenu.Item 
                                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                onClick={() => handleToggleStatus(emp)}
                              >
                                {emp.status === 'ACTIVE' ? (
                                  <><XCircle className="mr-2 h-4 w-4 text-destructive" /> Deactivate</>
                                ) : (
                                  <><CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Activate</>
                                )}
                              </DropdownMenu.Item>
                            </DropdownMenu.Content>
                          </DropdownMenu.Portal>
                        </DropdownMenu.Root>
                      </div>
                    </td>
                    
                    <td className="px-4 sm:py-4 text-muted-foreground sm:text-foreground">
                      {emp.mobile}
                    </td>
                    
                    {/* Desktop Only (lg+): Rate / Hr */}
                    <td className="hidden lg:table-cell px-4 py-4 text-muted-foreground">
                      ₹{emp.hourlyRate}
                    </td>
                    
                    {/* Desktop Only (lg+): Joined */}
                    <td className="hidden lg:table-cell px-4 py-4 text-muted-foreground">
                      {new Date(emp.joiningDate).toLocaleDateString()}
                    </td>
                    
                    {/* Desktop Only: Status */}
                    <td className="hidden sm:table-cell px-4 py-4">
                      <StatusBadge status={emp.status} />
                    </td>
                    
                    {/* Desktop Only: Actions */}
                    <td className="hidden sm:table-cell px-4 py-4 text-center">
                      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
                      <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger asChild>
                            <button 
                              className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                              aria-label="Employee actions"
                              title="Actions"
                            >
                              <MoreVertical className="h-[18px] w-[18px]" />
                            </button>
                          </DropdownMenu.Trigger>
                          <DropdownMenu.Portal>
                            <DropdownMenu.Content align="end" className="z-50 min-w-[160px] bg-popover text-popover-foreground rounded-md border shadow-md p-1 animate-in fade-in-80 zoom-in-95">
                              <DropdownMenu.Item 
                                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                onClick={() => handleOpenEdit(emp)}
                              >
                                <Edit2 className="mr-2 h-4 w-4" /> Edit Details
                              </DropdownMenu.Item>
                              <DropdownMenu.Separator className="-mx-1 my-1 h-px bg-muted" />
                              <DropdownMenu.Item 
                                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                onClick={() => handleToggleStatus(emp)}
                              >
                                {emp.status === 'ACTIVE' ? (
                                  <><XCircle className="mr-2 h-4 w-4 text-destructive" /> Deactivate</>
                                ) : (
                                  <><CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Activate</>
                                )}
                              </DropdownMenu.Item>
                            </DropdownMenu.Content>
                          </DropdownMenu.Portal>
                        </DropdownMenu.Root>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Details Slide-over */}
      <Dialog.Root open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm animate-in fade-in" />
          <Dialog.Content className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-md bg-background border-l shadow-2xl duration-300 animate-in slide-in-from-right overflow-y-auto flex flex-col">
            {viewingEmployee && (
              <>
                <div className="flex items-center justify-between p-6 border-b">
                  <Dialog.Title className="text-xl font-bold">Employee Details</Dialog.Title>
                  <Dialog.Close asChild>
                    <button className="p-2 hover:bg-muted rounded-full outline-none">
                      <X className="h-5 w-5" />
                    </button>
                  </Dialog.Close>
                </div>
                
                <div className="p-6 flex-1 space-y-8">
                  {/* Action Header */}
                  <div className="flex items-center justify-between">
                    <StatusBadge status={viewingEmployee.status} />
                    <button
                      onClick={() => handleOpenEdit(viewingEmployee)}
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4"
                    >
                      <Edit2 className="mr-2 h-4 w-4" /> Edit
                    </button>
                  </div>
                  
                  {/* Info Blocks */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        Personal Info
                      </h4>
                      <dl className="grid grid-cols-2 gap-4">
                        <div>
                          <dt className="text-sm text-muted-foreground">Name</dt>
                          <dd className="text-sm font-medium mt-1">{viewingEmployee.name}</dd>
                        </div>
                        <div>
                          <dt className="text-sm text-muted-foreground">Mobile</dt>
                          <dd className="text-sm font-medium mt-1">{viewingEmployee.mobile}</dd>
                        </div>
                      </dl>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        Employment Info
                      </h4>
                      <dl className="grid grid-cols-2 gap-4">
                        <div>
                          <dt className="text-sm text-muted-foreground">Joining Date</dt>
                          <dd className="text-sm font-medium mt-1">{new Date(viewingEmployee.joiningDate).toLocaleDateString()}</dd>
                        </div>
                        <div>
                          <dt className="text-sm text-muted-foreground">Hourly Rate</dt>
                          <dd className="text-sm font-medium mt-1">₹{viewingEmployee.hourlyRate}</dd>
                        </div>
                        {viewingEmployee.notes && (
                          <div className="col-span-2">
                            <dt className="text-sm text-muted-foreground">Notes</dt>
                            <dd className="text-sm font-medium mt-1 whitespace-pre-wrap">{viewingEmployee.notes}</dd>
                          </div>
                        )}
                      </dl>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        Bank Details
                      </h4>
                      <dl className="grid grid-cols-1 gap-4">
                        <div>
                          <dt className="text-sm text-muted-foreground">Bank Name</dt>
                          <dd className="text-sm font-medium mt-1">{viewingEmployee.bankName || '-'}</dd>
                        </div>
                        <div>
                          <dt className="text-sm text-muted-foreground">Account Number</dt>
                          <dd className="text-sm font-medium mt-1">{viewingEmployee.accountNumber || '-'}</dd>
                        </div>
                        <div>
                          <dt className="text-sm text-muted-foreground">IFSC Code</dt>
                          <dd className="text-sm font-medium mt-1">{viewingEmployee.ifscCode || '-'}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Dialog / Modal for Create and Edit */}
      <Dialog.Root open={isFormOpen} onOpenChange={setIsFormOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-in fade-in" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 animate-in fade-in-90 slide-in-from-bottom-10 sm:rounded-lg overflow-y-auto max-h-[90vh]">
            <Dialog.Title className="text-lg font-semibold leading-none tracking-tight">
              {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
            </Dialog.Title>
            <Dialog.Description className="text-sm text-muted-foreground mb-4">
              {editingEmployee 
                ? 'Make changes to the employee details below.' 
                : 'Enter the details of the new factory worker.'}
            </Dialog.Description>
            
            <EmployeeForm 
              initialData={editingEmployee} 
              onSubmit={handleSubmit}
              isLoading={createEmployee.isPending || updateEmployee.isPending}
              onCancel={() => setIsFormOpen(false)}
            />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
