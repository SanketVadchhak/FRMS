import type { PayrollEntry} from '@frms/shared';
import { PayrollStatus } from '@frms/shared';
import type { ColumnDef } from '@/hooks/useColumnPreferences';
import { formatCurrency, formatDate } from '@/utils/format';
import { StatusBadge } from '@/components/feedback';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { MoreVertical, Lock, CheckCircle } from 'lucide-react';

export interface PayrollTableContext {
  handleLock?: (payroll: PayrollEntry) => void;
  handleMarkPaid?: (payroll: PayrollEntry) => void;
}

export const PAYROLL_COLUMNS: ColumnDef<PayrollEntry, PayrollTableContext>[] = [
  {
    id: 'employeeName',
    label: 'Employee',
    defaultVisible: true,
    render: (p: PayrollEntry) => p.employeeName,
  },
  {
    id: 'department',
    label: 'Department',
    defaultVisible: true,
    render: (p: PayrollEntry) => p.department || '—',
  },
  {
    id: 'period',
    label: 'Period',
    defaultVisible: true,
    render: (p: PayrollEntry) => `${formatDate(p.payrollPeriodStart)} to ${formatDate(p.payrollPeriodEnd)}`,
  },
  {
    id: 'hours',
    label: 'Hours',
    defaultVisible: true,
    render: (p: PayrollEntry) => `${p.totalHours} hrs`,
  },
  {
    id: 'rate',
    label: 'Rate/Hr',
    defaultVisible: true,
    render: (p: PayrollEntry) => formatCurrency(p.hourlyRate),
  },
  {
    id: 'gross',
    label: 'Gross Pay',
    defaultVisible: true,
    render: (p: PayrollEntry) => formatCurrency(p.grossPay),
  },
  {
    id: 'additions',
    label: 'Additions',
    defaultVisible: true,
    render: (p: PayrollEntry) => <span className="text-green-600">{formatCurrency(p.totalAdditions)}</span>,
  },
  {
    id: 'deductions',
    label: 'Deductions',
    defaultVisible: true,
    render: (p: PayrollEntry) => <span className="text-red-600">{formatCurrency(p.totalDeductions)}</span>,
  },
  {
    id: 'net',
    label: 'Net Pay',
    defaultVisible: true,
    render: (p: PayrollEntry) => <span className="font-semibold">{formatCurrency(p.netPay)}</span>,
  },
  {
    id: 'status',
    label: 'Status',
    defaultVisible: true,
    render: (p: PayrollEntry) => {
      return <StatusBadge status={p.status} />;
    },
  },
  {
    id: 'notes',
    label: 'Notes',
    defaultVisible: false,
    render: (p: PayrollEntry) => p.notes || '—',
  },
  {
    id: 'actions',
    label: 'Actions',
    defaultVisible: true,
    fixed: 'right',
    render: (p: PayrollEntry, ctx?: PayrollTableContext) => (
      <div className="flex justify-center">
        {p.status === PayrollStatus.GENERATED || p.status === PayrollStatus.LOCKED ? (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button 
                className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                title="Actions"
              >
                <MoreVertical className="h-[18px] w-[18px]" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content align="end" className="z-50 min-w-[160px] bg-popover text-popover-foreground rounded-md border shadow-md p-1 animate-in fade-in-80 zoom-in-95">
                {p.status === PayrollStatus.GENERATED && (
                  <DropdownMenu.Item 
                    className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
                    onClick={() => ctx?.handleLock?.(p)}
                  >
                    <Lock className="mr-2 h-4 w-4" /> Lock Payroll
                  </DropdownMenu.Item>
                )}
                {p.status === PayrollStatus.LOCKED && (
                  <DropdownMenu.Item 
                    className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground text-green-600"
                    onClick={() => ctx?.handleMarkPaid?.(p)}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" /> Mark Paid
                  </DropdownMenu.Item>
                )}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        ) : (
          <span className="text-muted-foreground text-xs">{p.status === 'PAID' ? 'Settled' : '—'}</span>
        )}
      </div>
    )
  }
];
