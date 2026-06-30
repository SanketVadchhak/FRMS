import { useState, useEffect } from 'react';
import * as Dialog from "@radix-ui/react-dialog";
import { X } from 'lucide-react';
import { PaymentEffect, PaymentMethod, PaymentType } from '@frms/shared';
import { useCreatePayment } from '../hooks/usePayments';
import { useEmployees } from '@/modules/masters/employees/hooks/useEmployees';

interface PaySalaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultEmployeeId?: string;
  defaultAmount?: number;
}

export function PaySalaryDialog({ open, onOpenChange, defaultEmployeeId, defaultAmount }: PaySalaryDialogProps) {
  const { data: employees } = useEmployees();
  const createPayment = useCreatePayment();

  const [employeeId, setEmployeeId] = useState(defaultEmployeeId || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0] as string);
  const [amount, setAmount] = useState(defaultAmount?.toString() || '');
  const [method, setMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');

  // Update when props change
  useEffect(() => {
    if (open) {
      if (defaultEmployeeId) setEmployeeId(defaultEmployeeId);
      if (defaultAmount) setAmount(defaultAmount.toString());
    }
  }, [open, defaultEmployeeId, defaultAmount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !date || !amount) return;

    createPayment.mutate({
      employeeId,
      date,
      amount: Number(amount),
      type: PaymentType.SALARY,
      effect: PaymentEffect.DEDUCTION,
      method,
      referenceNumber,
      reason: notes || 'Salary Payment',
    }, {
      onSuccess: () => {
        onOpenChange(false);
        setAmount('');
        setReferenceNumber('');
        setNotes('');
      }
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-xl">
          <div className="flex flex-col space-y-1.5 text-center sm:text-left">
            <Dialog.Title className="text-lg font-semibold leading-none tracking-tight">Pay Salary</Dialog.Title>
            <Dialog.Description className="text-sm text-muted-foreground">
              Record a salary payment made to an employee.
            </Dialog.Description>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Employee</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  required
                >
                  <option value="">Select Employee</option>
                  {employees?.map((emp: any) => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Date</label>
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value || '')}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount Paid (₹)</label>
                <input 
                  type="number" 
                  min="0"
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Method</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={method}
                  onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                >
                  {Object.values(PaymentMethod).map(m => (
                    <option key={m} value={m}>{m.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Reference Number (Optional)</label>
              <input 
                type="text" 
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="Transaction ID, Cheque No, etc."
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes (Optional)</label>
              <input 
                type="text" 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Salary for June 2026"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4">
              <Dialog.Close asChild>
                <button type="button" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 mt-2 sm:mt-0">
                  Cancel
                </button>
              </Dialog.Close>
              <button 
                type="submit" 
                disabled={createPayment.isPending}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                {createPayment.isPending ? 'Saving...' : 'Confirm Payment'}
              </button>
            </div>
          </form>
          
          <Dialog.Close asChild>
            <button className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
