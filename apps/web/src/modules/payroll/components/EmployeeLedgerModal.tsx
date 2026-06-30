import * as Dialog from '@radix-ui/react-dialog';
import { X, Printer } from 'lucide-react';
import type { PayrollLedgerSummary } from '@frms/shared';
import { formatCurrency } from '@/utils/format';

interface EmployeeLedgerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: PayrollLedgerSummary | null;
}

export function EmployeeLedgerModal({ open, onOpenChange, employee }: EmployeeLedgerModalProps) {
  if (!employee) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-4xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-0 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-xl overflow-hidden flex flex-col max-h-[90vh]">
          
          {/* Header */}
          <div className="px-6 py-4 border-b bg-muted/20 flex items-center justify-between shrink-0">
            <div>
              <Dialog.Title className="text-xl font-bold">{employee.employeeName} - Ledger</Dialog.Title>
              <Dialog.Description className="text-sm text-muted-foreground mt-1">
                Permanent transaction history and running balance
              </Dialog.Description>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={handlePrint}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border bg-background hover:bg-accent h-9 px-3"
              >
                <Printer className="w-4 h-4 mr-2" /> Print
              </button>
              <Dialog.Close asChild>
                <button className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none p-2">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </button>
              </Dialog.Close>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-background">
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-muted/30 border rounded-lg p-4">
                <div className="text-sm text-muted-foreground mb-1">Total Earned (All-Time)</div>
                <div className="text-xl font-bold text-green-600">
                  {formatCurrency(employee.transactions.filter(t => t.type === 'CREDIT').reduce((sum, t) => sum + t.amount, 0))}
                </div>
              </div>
              <div className="bg-muted/30 border rounded-lg p-4">
                <div className="text-sm text-muted-foreground mb-1">Total Deducted / Paid (All-Time)</div>
                <div className="text-xl font-bold text-red-600">
                  {formatCurrency(employee.transactions.filter(t => t.type === 'DEBIT').reduce((sum, t) => sum + t.amount, 0))}
                </div>
              </div>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="text-sm text-primary/80 mb-1 font-medium">Current Outstanding Balance</div>
                <div className="text-2xl font-black text-primary">
                  {formatCurrency(
                    employee.transactions.length > 0 
                      ? employee.transactions[employee.transactions.length - 1]?.runningBalance || 0 
                      : 0
                  )}
                </div>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Description</th>
                    <th className="px-4 py-3 font-medium text-right">Debit (₹)</th>
                    <th className="px-4 py-3 font-medium text-right">Credit (₹)</th>
                    <th className="px-4 py-3 font-medium text-right bg-muted/20">Running Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {employee.transactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                        No transactions found for this employee.
                      </td>
                    </tr>
                  ) : (
                    employee.transactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-muted/20">
                        <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{new Date(tx.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                        <td className="px-4 py-3 font-medium">{tx.description}</td>
                        <td className="px-4 py-3 text-right text-red-600">
                          {tx.type === 'DEBIT' ? `-${formatCurrency(tx.amount)}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-right text-green-600">
                          {tx.type === 'CREDIT' ? `+${formatCurrency(tx.amount)}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-right font-bold bg-muted/10 tabular-nums">
                          {formatCurrency(tx.runningBalance)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
