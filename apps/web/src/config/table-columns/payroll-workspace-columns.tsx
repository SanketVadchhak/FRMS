/* eslint-disable */
import type { ColumnDef } from '@/hooks/useColumnPreferences';
import type { PayrollLedgerSummary } from '@frms/shared';
import { formatCurrency } from '@/utils/format';
import { StatusBadge } from '@/components/feedback';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { MoreHorizontal, FileText, Banknote, ShieldAlert, ArrowDownUp, Receipt, History } from 'lucide-react';

export interface PayrollWorkspaceContext {
  onPaySalary?: (emp: PayrollLedgerSummary) => void;
  onRecordAdvance?: (emp: PayrollLedgerSummary) => void;
  onRecordFine?: (emp: PayrollLedgerSummary) => void;
  onRecordAdjustment?: (emp: PayrollLedgerSummary) => void;
  onViewLedger?: (emp: PayrollLedgerSummary) => void;
  onDownloadPayslip?: (emp: PayrollLedgerSummary) => void;
}

export const PAYROLL_WORKSPACE_COLUMNS: ColumnDef<PayrollLedgerSummary, PayrollWorkspaceContext>[] = [
  {
    id: 'employeeName',
    label: 'Employee',
    defaultVisible: true,
    render: (p: PayrollLedgerSummary) => (
      <div>
        <div className="font-medium text-foreground">{p.employeeName}</div>
        {p.department && <div className="text-xs text-muted-foreground">{p.department}</div>}
      </div>
    ),
  },
  {
    id: 'totalHours',
    label: 'Total Hours',
    defaultVisible: true,
    render: (p: PayrollLedgerSummary) => `${p.totalHours} hrs`,
  },
  {
    id: 'hourlyRate',
    label: 'Rate / Hr',
    defaultVisible: true,
    render: (p: PayrollLedgerSummary) => `${formatCurrency(p.hourlyRate)}/hr`,
  },
  {
    id: 'salary',
    label: 'Salary',
    defaultVisible: true,
    render: (p: PayrollLedgerSummary) => formatCurrency(p.basicSalary),
  },
  {
    id: 'productionBonus',
    label: 'Prod Bonus',
    defaultVisible: true,
    render: (p: PayrollLedgerSummary) => formatCurrency(p.payrollBonus),
  },
  {
    id: 'additions',
    label: 'Additions',
    defaultVisible: true,
    render: (p: PayrollLedgerSummary) => formatCurrency(p.payrollAdditions),
  },
  {
    id: 'deductions',
    label: 'Deductions',
    defaultVisible: true,
    render: (p: PayrollLedgerSummary) => (
      <span className={p.payrollDeductions > 0 ? 'text-destructive' : ''}>
        {formatCurrency(p.payrollDeductions)}
      </span>
    ),
  },
  {
    id: 'netSalary',
    label: 'Net Salary',
    defaultVisible: true,
    render: (p: PayrollLedgerSummary) => <span className="font-semibold">{formatCurrency(p.netSalary)}</span>,
  },
  {
    id: 'amountPaid',
    label: 'Amount Paid',
    defaultVisible: true,
    render: (p: PayrollLedgerSummary) => <span className="text-primary">{formatCurrency(p.salaryPaid)}</span>,
  },
  {
    id: 'balanceRemaining',
    label: 'Balance Remaining',
    defaultVisible: true,
    render: (p: PayrollLedgerSummary) => (
      <span className={p.closingBalance > 0 ? 'font-bold text-destructive' : 'font-medium text-green-600'}>
        {formatCurrency(p.closingBalance)}
      </span>
    ),
  },
  {
    id: 'status',
    label: 'Status',
    defaultVisible: true,
    render: (p: PayrollLedgerSummary) => {
      if (p.paymentStatus === 'PAID') {
        return <StatusBadge status="PAID" />;
      }
      if (p.paymentStatus === 'PARTIALLY_PAID') {
        return (
          <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
            PARTIALLY PAID
          </span>
        );
      }
      return (
        <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
          UNPAID
        </span>
      );
    },
  },
  {
    id: 'actions',
    label: 'Actions',
    defaultVisible: true,
    fixed: 'right',
    render: (p: PayrollLedgerSummary, ctx?: PayrollWorkspaceContext) => (
      <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="h-8 w-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors focus:outline-none">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content align="end" className="w-48 z-50 bg-popover text-popover-foreground rounded-md border shadow-md p-1 animate-in data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2">
              <DropdownMenu.Item 
                onClick={() => ctx?.onViewLedger?.(p)}
                className="flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground"
              >
                <History className="w-4 h-4 mr-2" /> View Ledger
              </DropdownMenu.Item>
              <DropdownMenu.Item 
                onClick={() => ctx?.onDownloadPayslip?.(p)}
                className="flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground"
              >
                <FileText className="w-4 h-4 mr-2" /> Download Payslip
              </DropdownMenu.Item>
              
              <DropdownMenu.Separator className="h-px bg-border my-1" />
              
              {p.closingBalance > 0 && (
                <DropdownMenu.Item 
                  onClick={() => ctx?.onPaySalary?.(p)}
                  className="flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground text-primary font-medium"
                >
                  <Receipt className="w-4 h-4 mr-2" /> Pay Salary
                </DropdownMenu.Item>
              )}
              
              <DropdownMenu.Item 
                onClick={() => ctx?.onRecordAdvance?.(p)}
                className="flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground"
              >
                <Banknote className="w-4 h-4 mr-2" /> Record Advance
              </DropdownMenu.Item>
              <DropdownMenu.Item 
                onClick={() => ctx?.onRecordFine?.(p)}
                className="flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground text-destructive focus:text-destructive"
              >
                <ShieldAlert className="w-4 h-4 mr-2" /> Record Fine
              </DropdownMenu.Item>
              <DropdownMenu.Item 
                onClick={() => ctx?.onRecordAdjustment?.(p)}
                className="flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground"
              >
                <ArrowDownUp className="w-4 h-4 mr-2" /> Record Adjustment
              </DropdownMenu.Item>

            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    )
  }
];
