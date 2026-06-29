import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, AlertCircle } from 'lucide-react';
import { useRejectProductionEntry } from '../hooks/useProduction';

interface RejectDialogProps {
  entryId: string | null;
  onClose: () => void;
}

export function RejectDialog({ entryId, onClose }: RejectDialogProps) {
  const [reason, setReason] = useState('');
  const rejectMutation = useRejectProductionEntry();

  const handleReject = () => {
    if (!entryId || !reason.trim()) return;
    rejectMutation.mutate(
      { id: entryId, reason: reason.trim() },
      {
        onSuccess: () => {
          setReason('');
          onClose();
        },
      }
    );
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setReason('');
      onClose();
    }
  };

  return (
    <Dialog.Root open={!!entryId} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 animate-in fade-in" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] border bg-card p-6 shadow-lg sm:rounded-xl animate-in zoom-in-95">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <Dialog.Title className="text-lg font-semibold tracking-tight">Reject Production Entry</Dialog.Title>
                <Dialog.Description className="text-sm text-muted-foreground">
                  Please provide a reason for rejecting this entry.
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Dialog.Close>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="reason" className="block text-sm font-medium mb-1.5">
                Rejection Reason <span className="text-destructive">*</span>
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="E.g., Incorrect quantity reported..."
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="h-10 px-4 py-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="button"
                onClick={handleReject}
                disabled={!reason.trim() || rejectMutation.isPending}
                className="h-10 px-4 py-2 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 inline-flex items-center gap-2"
              >
                {rejectMutation.isPending ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
