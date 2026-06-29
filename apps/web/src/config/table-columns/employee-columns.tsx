import type { ColumnDef as BaseColumnDef } from '@/hooks/useColumnPreferences';
import type { Employee } from '@frms/shared';
import { StatusBadge } from '@/components/feedback/StatusBadge';
import { Calendar, MoreVertical, Edit2, CheckCircle, XCircle } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { formatDate } from '@/utils';

export interface EmployeeTableContext {
  handleOpenCalendar: (emp: Employee) => void;
  handleToggleStatus: (emp: Employee) => void;
  handleOpenEdit: (emp: Employee) => void;
}

export type EmployeeColumnDef = BaseColumnDef<Employee, EmployeeTableContext>;

export const EMPLOYEE_COLUMNS: EmployeeColumnDef[] = [
  { 
    id: 'name',         
    label: 'Name',         
    defaultVisible: true,  
    fixed: 'left',
    render: (emp) => emp.name || '—'
  },
  { 
    id: 'mobile',       
    label: 'Mobile',        
    defaultVisible: true,
    render: (emp) => emp.mobile || '—'
  },
  { 
    id: 'status',       
    label: 'Status',        
    defaultVisible: true,
    render: (emp) => <StatusBadge status={emp.status} />
  },
  { 
    id: 'hourly_rate',  
    label: 'Rate / Hr',     
    defaultVisible: true,
    render: (emp) => emp.hourlyRate !== undefined ? `₹${emp.hourlyRate}` : '—'
  },
  { 
    id: 'joining_date', 
    label: 'Joined',        
    defaultVisible: true,
    render: (emp) => emp.joiningDate ? formatDate(emp.joiningDate) : '—'
  },
  { 
    id: 'bank_name',    
    label: 'Bank',          
    defaultVisible: false,
    render: (emp) => emp.bankName || '—'
  },
  { 
    id: 'account_no',   
    label: 'Account No.',   
    defaultVisible: false,
    render: (emp) => emp.accountNumber || '—'
  },
  { 
    id: 'ifsc',         
    label: 'IFSC Code',     
    defaultVisible: false,
    render: (emp) => emp.ifscCode || '—'
  },
  { 
    id: 'notes',        
    label: 'Notes',         
    defaultVisible: false,
    render: (emp) => emp.notes || '—'
  },
  { 
    id: 'attendance',   
    label: 'Attendance',    
    defaultVisible: true, 
    fixed: 'right',
    render: (emp, ctx) => (
      <div className="flex justify-center">
        <button
          onClick={() => ctx?.handleOpenCalendar(emp)}
          className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="View Attendance Calendar"
        >
          <Calendar className="h-[18px] w-[18px]" />
        </button>
      </div>
    )
  },
  { 
    id: 'actions',      
    label: 'Actions',       
    defaultVisible: true,  
    fixed: 'right',
    render: (emp, ctx) => (
      <div className="flex justify-center">
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
                onClick={() => ctx?.handleOpenEdit(emp)}
              >
                <Edit2 className="mr-2 h-4 w-4" /> Edit Details
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="-mx-1 my-1 h-px bg-muted" />
              <DropdownMenu.Item 
                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                onClick={() => ctx?.handleToggleStatus(emp)}
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
    )
  },
];
