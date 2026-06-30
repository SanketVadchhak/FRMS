/* eslint-disable */
import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Calendar } from 'lucide-react';
import { usePreviewPayroll, useGeneratePayroll } from '../hooks/usePayroll';
import { formatCurrency } from '@/utils/format';

interface GeneratePayrollDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultPeriodStart?: string;
  defaultPeriodEnd?: string;
}

export function GeneratePayrollDialog({ open, onOpenChange, defaultPeriodStart, defaultPeriodEnd }: GeneratePayrollDialogProps) {
  const [periodStart, setPeriodStart] = useState(defaultPeriodStart || '');
  const [periodEnd, setPeriodEnd] = useState(defaultPeriodEnd || '');
  
  useEffect(() => {
    if (open) {
      if (defaultPeriodStart) setPeriodStart(defaultPeriodStart);
      if (defaultPeriodEnd) setPeriodEnd(defaultPeriodEnd);
    }
  }, [open, defaultPeriodStart, defaultPeriodEnd]);

  const { data: preview, error, isLoading, isError } = usePreviewPayroll(periodStart, periodEnd);
  const generatePayroll = useGeneratePayroll();

  const handleGenerate = () => {
    if (!periodStart || !periodEnd) return;
    generatePayroll.mutate({ start: periodStart, end: periodEnd, notes: '' }, {
      onSuccess: () => {
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-xl">
          <div className="flex flex-col space-y-1.5 text-center sm:text-left">
            <Dialog.Title className="text-lg font-semibold leading-none tracking-tight">Generate Payroll</Dialog.Title>
            <Dialog.Description className="text-sm text-muted-foreground">
              Lock the selected period and officially generate payroll records.
            </Dialog.Description>
          </div>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Period Start</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input 
                    type="date" 
                    value={periodStart}
                    onChange={e => setPeriodStart(e.target.value || '')}
                    className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Period End</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input 
                    type="date" 
                    value={periodEnd}
                    onChange={e => setPeriodEnd(e.target.value || '')}
                    className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </div>
            </div>

            {periodStart && periodEnd && (
              <div className="rounded-lg border bg-muted/50 p-4 mt-4">
                <h4 className="text-sm font-semibold mb-3">Payroll Preview</h4>
                {isLoading ? (
                  <div className="text-sm text-muted-foreground py-4 text-center">Calculating payroll...</div>
                ) : isError ? (
                  <div className="text-sm text-destructive py-2">{error instanceof Error ? error.message : 'Error computing preview'}</div>
                ) : preview ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Employees Included:</span>
                      <span className="font-medium">{preview.totalEmployees}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Hours Logged:</span>
                      <span className="font-medium">{preview.totalHours} hrs</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Gross Payroll:</span>
                      <span className="font-medium">{formatCurrency(preview.totalGross)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Deductions:</span>
                      <span className="font-medium text-destructive">-{formatCurrency(preview.totalDeductions)}</span>
                    </div>
                    <div className="pt-2 mt-2 border-t flex justify-between text-sm font-bold">
                      <span>Net Payroll to Disburse:</span>
                      <span className="text-primary">{formatCurrency(preview.totalNet)}</span>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4">
              <Dialog.Close asChild>
                <button type="button" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 mt-2 sm:mt-0">
                  Cancel
                </button>
              </Dialog.Close>
              <button 
                onClick={handleGenerate}
                disabled={generatePayroll.isPending || !preview || isError}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                {generatePayroll.isPending ? 'Generating...' : 'Confirm Generation'}
              </button>
            </div>
          </div>
          
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
