import { useState, useCallback, useEffect } from 'react';
import { X, Edit2, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import type { ProductionEntry } from '@frms/shared';
import {
  useProductionEntries,
  useApproveProductionEntry,
  useRejectProductionEntry,
} from '../hooks/useProduction';
import { useEmployees } from '@/modules/masters/employees/hooks/useEmployees';
import { useMachines } from '@/modules/masters/machines/hooks/useMachines';
import { usePermissions } from '@/hooks/usePermissions';
import { ProductionStatus } from '@frms/shared';
import { ROUTES, PERMISSIONS } from '@/constants';
import { cn } from '@/utils/cn';
import * as Dialog from '@radix-ui/react-dialog';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDateTime(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

const STATUS_CONFIG: Record<
  ProductionStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  [ProductionStatus.DRAFT]: {
    label: 'Draft',
    className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    icon: null,
  },
  [ProductionStatus.PENDING]: {
    label: 'Pending Review',
    className: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    icon: <Clock className="h-3 w-3" />,
  },
  [ProductionStatus.APPROVED]: {
    label: 'Approved',
    className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  [ProductionStatus.REJECTED]: {
    label: 'Rejected',
    className: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    icon: <XCircle className="h-3 w-3" />,
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function DrawerField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

function DrawerSection({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
interface ApprovalDrawerProps {
  entryId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contextEntries?: ProductionEntry[];
  onNavigateNext?: (id: string) => void;
}

export function ApprovalDrawer({ entryId, open, onOpenChange, contextEntries, onNavigateNext }: ApprovalDrawerProps) {
  const navigate = useNavigate();
  const { can } = usePermissions();

  const { data: entries } = useProductionEntries();
  const { data: employees } = useEmployees();
  const { data: machines } = useMachines();

  const approveMutation = useApproveProductionEntry();
  const rejectMutation = useRejectProductionEntry();

  const [confirmApproveOpen, setConfirmApproveOpen] = useState(false);
  const [confirmRejectOpen, setConfirmRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [approveNext, setApproveNext] = useState(false);

  const entry = entries?.find((e) => e.id === entryId);
  const canApprove = can(PERMISSIONS.PRODUCTION_APPROVE);

  const handleApprove = useCallback(() => {
    approveMutation.mutate(entryId, {
      onSuccess: () => {
        setConfirmApproveOpen(false);
        if (approveNext && contextEntries && onNavigateNext) {
          const currentIndex = contextEntries.findIndex(e => e.id === entryId);
          if (currentIndex >= 0) {
            const nextEntry = contextEntries.slice(currentIndex + 1).find(e => e.status === ProductionStatus.PENDING);
            if (nextEntry) {
              onNavigateNext(nextEntry.id!);
              return;
            }
          }
        }
        onOpenChange(false);
      },
    });
  }, [approveMutation, entryId, approveNext, contextEntries, onNavigateNext, onOpenChange]);

  const handleReject = useCallback(() => {
    if (!rejectReason.trim()) return;
    rejectMutation.mutate(
      { id: entryId, reason: rejectReason },
      {
        onSuccess: () => {
          setConfirmRejectOpen(false);
          setRejectReason('');
          onOpenChange(false);
        },
      },
    );
  }, [rejectReason, rejectMutation, entryId, onOpenChange]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;
      
      if (e.key === 'a' || e.key === 'A') {
        if (canApprove && entry?.status === ProductionStatus.PENDING && !confirmApproveOpen && !confirmRejectOpen) {
          e.preventDefault();
          setConfirmApproveOpen(true);
        }
      } else if (e.key === 'r' || e.key === 'R') {
        if (canApprove && entry?.status === ProductionStatus.PENDING && !confirmApproveOpen && !confirmRejectOpen) {
          e.preventDefault();
          setConfirmRejectOpen(true);
        }
      } else if (e.key === 'Enter') {
        if (confirmApproveOpen) {
          e.preventDefault();
          handleApprove();
        }
        if (confirmRejectOpen) {
          e.preventDefault();
          handleReject();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, canApprove, entry?.status, confirmApproveOpen, confirmRejectOpen, handleApprove, handleReject]);

  if (!entry) return null;

  const employee = employees?.find((e) => e.id === entry.employeeId);
  const machine = machines?.find((m) => m.id === entry.machineId);
  const statusConfig = STATUS_CONFIG[entry.status];

  const canEdit =
    can(PERMISSIONS.PRODUCTION_WRITE) && entry.status === ProductionStatus.DRAFT;

  return (
    <>
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l bg-background shadow-xl duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right flex flex-col focus:outline-none">

            {/* Header */}
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div className="flex items-center gap-3">
                <Dialog.Title className="text-base font-semibold">Production Entry</Dialog.Title>
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
                    statusConfig.className,
                  )}
                >
                  {statusConfig.icon}
                  {statusConfig.label}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {canEdit && (
                  <button
                    onClick={() => navigate(ROUTES.PRODUCTION.EDIT.replace(':id', entryId))}
                    className="p-2 rounded-md hover:bg-muted text-muted-foreground transition-colors"
                    title="Edit Entry"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                )}
                <Dialog.Close className="p-2 rounded-md hover:bg-muted text-muted-foreground transition-colors">
                  <X className="h-4 w-4" />
                </Dialog.Close>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

              {/* Setup */}
              <DrawerSection title="Setup">
                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                  <DrawerField label="Employee" value={employee?.name ?? entry.employeeId} />
                  <DrawerField label="Machine" value={machine?.name ?? entry.machineId} />
                  <DrawerField
                    label="Date"
                    value={new Date(entry.date + 'T00:00:00').toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  />
                  <DrawerField
                    label="Shift"
                    value={
                      <span
                        className={cn(
                          'inline-block px-2 py-0.5 rounded text-xs font-medium',
                          entry.shift === 'DAY'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                            : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
                        )}
                      >
                        {entry.shift === 'DAY' ? '☀ Day' : '🌙 Night'}
                      </span>
                    }
                  />
                </div>
              </DrawerSection>

              {/* Design Sessions */}
              <DrawerSection title="Design Produced">
                <div className="space-y-2">
                  {(entry.details || []).map((detail, idx) => (
                    <div key={detail.id ?? idx} className="rounded-lg border bg-muted/30 p-3">
                      {(entry.details?.length ?? 0) > 1 && (
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                          Session {idx + 1}
                        </p>
                      )}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <DrawerField label="Design Name" value={detail.designName} />
                        <DrawerField
                          label="Total Stitches"
                          value={(detail.totalStitches ?? 0).toLocaleString('en-IN')}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </DrawerSection>

              {/* Production Metrics */}
              <DrawerSection title="Production">
                <div className="rounded-lg border bg-muted/30 p-3 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                      Quantity
                    </p>
                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-500">
                      {entry.productionQuantity ?? 0}
                      <span className="text-xs font-normal text-muted-foreground ml-1">pcs</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                      Hours Worked
                    </p>
                    <p className="text-xl font-bold">
                      {entry.hoursWorked ?? 0}
                      <span className="text-xs font-normal text-muted-foreground ml-1">hrs</span>
                    </p>
                  </div>
                </div>
              </DrawerSection>

              {/* Shift Metrics */}
              <DrawerSection title="Shift Metrics">
                <div className="rounded-lg border bg-muted/30 p-3 grid grid-cols-3 gap-3 text-sm">
                  <DrawerField label="Frames Changed" value={entry.framesChanged ?? 0} />
                  <DrawerField label="Thread Breakage" value={entry.threadBreakage ?? 0} />
                  <DrawerField label="Bonus" value={`₹${entry.bonus ?? 0}`} />
                </div>
              </DrawerSection>

              {/* Notes */}
              {entry.notes && entry.notes.trim() && (
                <DrawerSection title="Notes">
                  <p className="text-sm bg-muted/40 rounded-lg p-3 leading-relaxed">
                    {entry.notes}
                  </p>
                </DrawerSection>
              )}

              {/* Rejection History */}
              {entry.rejectionReason && (
                <DrawerSection title="Rejection History">
                  <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-3 space-y-2 border border-red-100 dark:border-red-900/50">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
                      Rejected By System
                    </p>
                    <p className="text-sm text-red-800 dark:text-red-200 leading-relaxed">
                      {entry.rejectionReason}
                    </p>
                  </div>
                </DrawerSection>
              )}

              {/* Audit trail */}
              <DrawerSection title="Audit">
                <div className="space-y-1.5 text-xs text-muted-foreground bg-muted/20 p-3 rounded-lg border">
                  {entry.createdAt && (
                    <div className="flex justify-between">
                      <span>Created</span>
                      <span className="font-medium">{formatDateTime(entry.createdAt)}</span>
                    </div>
                  )}
                  {entry.updatedAt && entry.updatedAt !== entry.createdAt && (
                    <div className="flex justify-between">
                      <span>Last Updated</span>
                      <span className="font-medium">{formatDateTime(entry.updatedAt)}</span>
                    </div>
                  )}
                  {entry.approvedAt && (
                    <div className="flex justify-between">
                      <span>Approved By {entry.approvedBy}</span>
                      <span className="font-medium">{formatDateTime(entry.approvedAt)}</span>
                    </div>
                  )}
                </div>
              </DrawerSection>
            </div>

            {/* Action footer — only for supervisors/admins reviewing PENDING entries */}
            {entry.status === ProductionStatus.PENDING && canApprove && (
              <div className="border-t bg-background px-5 py-4 flex flex-col gap-3">
                {contextEntries && onNavigateNext && (
                  <label className="flex items-center gap-2 cursor-pointer self-end">
                    <input 
                      type="checkbox"
                      checked={approveNext}
                      onChange={(e) => setApproveNext(e.target.checked)}
                      className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                    />
                    <span className="text-xs font-medium text-muted-foreground select-none">
                      Approve Next
                    </span>
                  </label>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmRejectOpen(true)}
                    disabled={rejectMutation.isPending || approveMutation.isPending}
                    className="flex-1 rounded-lg border border-destructive bg-transparent px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors disabled:opacity-50"
                  >
                    Reject <kbd className="hidden sm:inline-block ml-2 px-1.5 py-0.5 rounded bg-muted/50 text-[10px] uppercase font-sans">R</kbd>
                  </button>
                  <button
                    onClick={() => setConfirmApproveOpen(true)}
                    disabled={rejectMutation.isPending || approveMutation.isPending}
                    className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    Approve <kbd className="hidden sm:inline-block ml-2 px-1.5 py-0.5 rounded bg-primary-foreground/20 text-[10px] uppercase font-sans">A</kbd>
                  </button>
                </div>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Confirm Approve */}
      <ConfirmDialog
        open={confirmApproveOpen}
        onOpenChange={setConfirmApproveOpen}
        title="Approve Production Entry"
        description="Are you sure you want to approve this entry? It will be marked as ready for payroll processing."
        confirmText="Approve Entry"
        onConfirm={handleApprove}
      />

      {/* Confirm Reject — includes mandatory reason textarea */}
      <ConfirmDialog
        open={confirmRejectOpen}
        onOpenChange={setConfirmRejectOpen}
        title="Reject Production Entry"
        description={
          <div className="space-y-3 mt-1">
            <p className="text-sm text-muted-foreground">
              Provide a reason for rejection. The operator will see this when they revisit the entry.
            </p>
            <textarea
              placeholder="Reason for rejection…"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-destructive min-h-[80px] resize-none"
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
