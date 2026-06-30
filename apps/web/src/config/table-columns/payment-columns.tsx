import type { Payment} from '@frms/shared';
import { PaymentEffect } from '@frms/shared';
import type { ColumnDef } from '@/hooks/useColumnPreferences';
import { formatCurrency, formatDate } from '@/utils/format';
import { StatusBadge } from '@/components/feedback';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { MoreVertical, Edit2, Trash2 } from 'lucide-react';

export interface PaymentTableContext {
  employees?: Record<string, string>;
  handleEdit?: (payment: Payment) => void;
  handleDelete?: (payment: Payment) => void;
}

export const PAYMENT_COLUMNS: ColumnDef<Payment, PaymentTableContext>[] = [
  {
    id: 'employeeName',
    label: 'Employee',
    defaultVisible: true,
    render: (pay: Payment, ctx?: PaymentTableContext) => ctx?.employees?.[pay.employeeId] || pay.employeeId,
  },
  {
    id: 'date',
    label: 'Date',
    defaultVisible: true,
    render: (pay: Payment) => formatDate(pay.date),
  },
  {
    id: 'type',
    label: 'Type',
    defaultVisible: true,
    render: (pay: Payment) => pay.type.replace('_', ' '),
  },
  {
    id: 'amount',
    label: 'Amount',
    defaultVisible: true,
    render: (pay: Payment) => {
      const isAdd = pay.effect === PaymentEffect.ADDITION;
      return (
        <span className={isAdd ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
          {isAdd ? '+' : '-'}{formatCurrency(pay.amount)}
        </span>
      );
    }
  },
  {
    id: 'method',
    label: 'Method',
    defaultVisible: true,
    render: (pay: Payment) => pay.method.replace('_', ' '),
  },
  {
    id: 'referenceNumber',
    label: 'Reference',
    defaultVisible: false,
    render: (pay: Payment) => pay.referenceNumber || '—',
  },
  {
    id: 'reason',
    label: 'Reason',
    defaultVisible: true,
    render: (pay: Payment) => pay.reason || '—',
  },
  {
    id: 'status',
    label: 'Status',
    defaultVisible: true,
    render: (pay: Payment) => <StatusBadge status={pay.status} />,
  },
  {
    id: 'actions',
    label: 'Actions',
    defaultVisible: true,
    fixed: 'right',
    render: (pay: Payment, ctx?: PaymentTableContext) => (
      <div className="flex justify-center">
        {pay.status === 'PENDING' ? (
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
                <DropdownMenu.Item 
                  className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
                  onClick={() => ctx?.handleEdit?.(pay)}
                >
                  <Edit2 className="mr-2 h-4 w-4" /> Edit
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="-mx-1 my-1 h-px bg-muted" />
                <DropdownMenu.Item 
                  className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-destructive hover:text-destructive-foreground text-destructive"
                  onClick={() => ctx?.handleDelete?.(pay)}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        ) : (
          <span className="text-muted-foreground text-xs">Locked</span>
        )}
      </div>
    )
  }
];
