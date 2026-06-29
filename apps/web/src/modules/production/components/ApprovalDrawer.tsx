import { useState } from 'react';
import { X, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { useProductionEntries, useApproveProductionEntry, useRejectProductionEntry } from '../hooks/useProduction';
import { useEmployees } from '@/modules/masters/employees/hooks/useEmployees';
import { useMachines } from '@/modules/masters/machines/hooks/useMachines';
import { ProductionStatus } from '@frms/shared';
import { ROUTES } from '@/constants';
import * as Dialog from '@radix-ui/react-dialog';

interface ApprovalDrawerProps {
  entryId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApprovalDrawer({ entryId, open, onOpenChange }: ApprovalDrawerProps) {
  const navigate = useNavigate();
  const { data: entries } = useProductionEntries();
  const { data: employees } = useEmployees();
  const { data: machines } = useMachines();

  const approveMutation = useApproveProductionEntry();
  const rejectMutation = useRejectProductionEntry();

  const [confirmApproveOpen, setConfirmApproveOpen] = useState(false);
  const [confirmRejectOpen, setConfirmRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const entry = entries?.find(e => e.id === entryId);
  if (!entry) return null;

  const employee = employees?.find(e => e.id === entry.employeeId);
  const machine = machines?.find(m => m.id === entry.machineId);

  let parsedNotes = '';
  let parsedStitches: { stitches: number }[] = [];
  let parsedHours = 0;
  try {
    if (entry.notes) {
      const parsed = JSON.parse(entry.notes);
      if (parsed.sessions) {
        parsedStitches = parsed.sessions;
        parsedNotes = parsed.text || '';
        parsedHours = parsed.hoursWorked || 0;
      } else {
        parsedNotes = entry.notes;
      }
    }
  } catch {
    parsedNotes = entry.notes || '';
  }

  const handleApprove = () => {
    approveMutation.mutate(entryId, {
      onSuccess: () => {
        setConfirmApproveOpen(false);
        onOpenChange(false);
      }
    });
  };

  const handleReject = () => {
    if (!rejectReason.trim()) return;
    rejectMutation.mutate({ id: entryId, reason: rejectReason }, {
      onSuccess: () => {
        setConfirmRejectOpen(false);
        setRejectReason('');
        onOpenChange(false);
      }
    });
  };

  return (
    <>
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l bg-background shadow-lg duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right flex flex-col">
            
            <div className="flex items-center justify-between border-b px-6 py-4">
              <Dialog.Title className="text-lg font-semibold">Production Details</Dialog.Title>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(ROUTES.PRODUCTION.EDIT.replace(':id', entryId))}
                  className="p-2 rounded-md hover:bg-muted text-muted-foreground transition-colors"
                  title="Edit Entry"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <Dialog.Close className="p-2 rounded-md hover:bg-muted text-muted-foreground transition-colors">
                  <X className="h-4 w-4" />
                </Dialog.Close>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Employee</p>
                  <p className="font-medium">{employee?.name || entry.employeeId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Machine</p>
                  <p className="font-medium">{machine?.name || entry.machineId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Date</p>
                  <p className="font-medium">{new Date(entry.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Shift</p>
                  <p className="font-medium">{entry.shift}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-3">Design Produced</h3>
                <div className="space-y-3">
                  {entry.details.map((detail, idx) => {
                    const designName = detail.designId;
                    const stitches = parsedStitches[idx]?.stitches || 0;
                    return (
                      <div key={detail.id || idx} className="rounded-lg border p-4 bg-muted/30">
                        {entry.details.length > 1 && (
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Session {idx + 1}</p>
                        )}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground text-xs mb-1">Design Name</p>
                            <p className="font-medium">{designName}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs mb-1">Total Stitches</p>
                            <p className="font-medium">{stitches.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-3">Production</h3>
                <div className="grid grid-cols-2 gap-4 text-sm rounded-lg border p-4 bg-muted/30">
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Production Quantity</p>
                    <p className="font-semibold text-green-600 dark:text-green-500 text-lg">
                      {entry.details[0]?.completedPieces || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Hours Worked</p>
                    <p className="font-semibold text-lg">{parsedHours} Hours</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-3">Shift Metrics</h3>
                <div className="grid grid-cols-2 gap-4 text-sm rounded-lg border p-4 bg-muted/30">
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Frames Changed</p>
                    <p className="font-medium">{entry.framesChanged}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Thread Breakage</p>
                    <p className="font-medium">{entry.threadBreakage}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Bonus</p>
                    <p className="font-medium">₹{entry.bonus}</p>
                  </div>
                </div>
              </div>

              {parsedNotes && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Notes</h3>
                  <p className="text-sm bg-muted/50 p-3 rounded-md">{parsedNotes}</p>
                </div>
              )}
              
              {entry.rejectionReason && (
                <div>
                  <h3 className="text-sm font-semibold mb-2 text-red-500">Rejection Reason</h3>
                  <p className="text-sm bg-red-50 dark:bg-red-950 p-3 rounded-md text-red-800 dark:text-red-200">{entry.rejectionReason}</p>
                </div>
              )}

            </div>

            {/* Actions */}
            {entry.status === ProductionStatus.PENDING && (
              <div className="border-t p-4 flex gap-3 bg-background">
                <button
                  onClick={() => setConfirmRejectOpen(true)}
                  className="flex-1 rounded-md border border-destructive bg-transparent px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => setConfirmApproveOpen(true)}
                  className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Approve
                </button>
              </div>
            )}
            
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <ConfirmDialog
        open={confirmApproveOpen}
        onOpenChange={setConfirmApproveOpen}
        title="Approve Production Entry"
        description="Are you sure you want to approve this entry? It will be marked as ready for payroll processing."
        confirmText="Approve Entry"
        onConfirm={handleApprove}
      />

      <ConfirmDialog
        open={confirmRejectOpen}
        onOpenChange={setConfirmRejectOpen}
        title="Reject Production Entry"
        description={
          <div className="space-y-4 mt-2">
            <p>Please provide a reason for rejecting this entry. The operator will be notified to make corrections.</p>
            <textarea
              placeholder="Reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-destructive min-h-[80px]"
            />
          </div>
        }
        confirmText="Reject Entry"
        variant="destructive"
        onConfirm={handleReject}
      />
    </>
  );
}
