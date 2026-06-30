import type { ColumnDef as BaseColumnDef } from '@/hooks/useColumnPreferences';
import type { ProductionEntry } from '@frms/shared';
import { ProductionStatus } from '@frms/shared';
import { Tooltip } from '@/components';
import { StatusBadge } from '@/components/feedback/StatusBadge';
import { MessageSquare, CheckCircle2, XCircle } from 'lucide-react';
import { formatProductionDate } from '@/utils';

export interface TableContext {
  employees: { id?: string; name: string }[];
  formatDateTime: (iso?: string) => string;
  totalQty: number;
  totalHours: number;
  selectedRows?: Set<string>;
  toggleRow?: (id: string) => void;
  toggleAll?: () => void;
  selectedCount?: number;
  pendingCount?: number;
  handleApprove?: (id: string) => void;
  setRejectEntryId?: (id: string) => void;
  isApproving?: boolean;
  isApprovalQueue?: boolean;
  navigate?: (path: string) => void;
}

export type ProductionColumnDef = BaseColumnDef<ProductionEntry, TableContext>;

export const PRODUCTION_COLUMNS: ProductionColumnDef[] = [
  {
    id: 'checkbox',
    label: 'Select',
    defaultVisible: true,
    fixed: 'left',
    width: 48,
    renderHeader: (ctx) => (
      <input 
        type="checkbox" 
        onChange={ctx?.toggleAll}
        checked={(ctx?.selectedCount ?? 0) > 0 && ctx?.selectedCount === ctx?.pendingCount}
        className="h-3.5 w-3.5 rounded border-gray-300 text-primary focus:ring-primary align-middle"
      />
    ),
    render: (entry, ctx) => {
      const isSelected = ctx?.selectedRows?.has(entry.id!);
      const canSelect = entry.status === ProductionStatus.PENDING;
      return canSelect ? (
        <input 
          type="checkbox" 
          checked={isSelected}
          onChange={() => ctx?.toggleRow?.(entry.id!)}
          className="h-3.5 w-3.5 rounded border-gray-300 text-primary focus:ring-primary align-middle"
        />
      ) : null;
    }
  },
  { 
    id: 'date', 
    label: 'Date', 
    defaultVisible: true,
    width: 90,
    renderHeader: () => 'Date',
    render: (entry) => formatProductionDate(entry.date),
    renderFooter: () => 'Total'
  },
  { 
    id: 'employee', 
    label: 'Employee', 
    defaultVisible: true,
    width: 160,
    renderHeader: () => 'Employee',
    render: (entry, ctx) => {
      const emp = ctx.employees.find((e) => e.id === entry.employeeId);
      return emp?.name ?? entry.employeeId;
    }
  },
  { 
    id: 'design', 
    label: 'Design', 
    defaultVisible: true,
    renderHeader: () => 'Design',
    render: (entry) => {
      const multipleDesigns = entry.details && entry.details.length > 1;
      const firstDesign = entry.details?.[0];
      if (multipleDesigns) {
        return (
          <Tooltip content={
            <div className="space-y-1">
              {entry.details.map((d, i) => <div key={i}>{d.designName || 'No Design'} ({(d.totalStitches || 0).toLocaleString()} sts)</div>)}
            </div>
          }>
            <span className="border-b border-dashed border-muted-foreground cursor-help text-primary">
              {firstDesign?.designName} +{entry.details.length - 1}
            </span>
          </Tooltip>
        );
      }
      return firstDesign?.designName || '—';
    }
  },
  { 
    id: 'total_stitches', 
    label: 'Total Stitches', 
    defaultVisible: true,
    renderHeader: () => 'Stitches',
    render: (entry) => {
      const total = entry.details?.reduce((acc, d) => acc + (d.totalStitches || 0), 0) || 0;
      return total.toLocaleString();
    }
  },
  { 
    id: 'qty', 
    label: 'Qty', 
    defaultVisible: true,
    renderHeader: () => 'Qty',
    render: (entry) => entry.productionQuantity,
    renderFooter: (ctx) => ctx.totalQty.toLocaleString()
  },
  { 
    id: 'hours', 
    label: 'Hours', 
    defaultVisible: true,
    renderHeader: () => 'Hours',
    render: (entry) => entry.hoursWorked,
    renderFooter: (ctx) => ctx.totalHours.toLocaleString()
  },
  { 
    id: 'frames', 
    label: 'Frames', 
    defaultVisible: true,
    renderHeader: () => 'Frames',
    render: (entry) => entry.framesChanged
  },
  { 
    id: 'thread_breaks', 
    label: 'Thread Breaks', 
    defaultVisible: true,
    renderHeader: () => 'T.Breaks',
    render: (entry) => entry.threadBreakage
  },
  { 
    id: 'bonus', 
    label: 'Bonus', 
    defaultVisible: true,
    renderHeader: () => 'Bonus',
    render: (entry) => entry.bonus > 0 ? `₹${entry.bonus}` : '—'
  },
  { 
    id: 'notes', 
    label: 'Notes', 
    defaultVisible: true,
    renderHeader: () => 'Notes',
    render: (entry) => {
      if (!entry.notes) return '—';
      return (
        <Tooltip content={<div className="max-w-[200px] whitespace-normal">{entry.notes}</div>}>
          <button className="text-muted-foreground hover:text-foreground flex justify-center w-full">
            <MessageSquare className="h-4 w-4" />
          </button>
        </Tooltip>
      );
    }
  },
  { 
    id: 'status', 
    label: 'Status', 
    defaultVisible: true, 
    renderHeader: () => 'Status',
    render: (entry) => <StatusBadge status={entry.status} />
  },
  { 
    id: 'created_by', 
    label: 'Created By', 
    defaultVisible: true,
    renderHeader: () => 'Submitted By',
    render: (entry) => entry.createdBy
  },
  { 
    id: 'created_at', 
    label: 'Created At', 
    defaultVisible: true,
    renderHeader: () => 'Submitted At',
    render: (entry, ctx) => ctx.formatDateTime(entry.createdAt)
  },
  { 
    id: 'approved_by', 
    label: 'Approved By', 
    defaultVisible: true,
    renderHeader: () => 'Approved By',
    render: (entry) => entry.approvedBy || '—'
  },
  { 
    id: 'approved_at', 
    label: 'Approved At', 
    defaultVisible: true,
    renderHeader: () => 'Approved At',
    render: (entry, ctx) => entry.approvedAt ? ctx.formatDateTime(entry.approvedAt) : '—'
  },
  { 
    id: 'actions', 
    label: 'Actions', 
    defaultVisible: true, 
    fixed: 'right',
    renderHeader: () => 'Actions',
    render: (entry, ctx) => {
      if (entry.status === ProductionStatus.PENDING && ctx.isApprovalQueue) {
        return (
          <div className="flex items-center justify-center gap-1.5">
            <button 
              onClick={() => ctx.handleApprove?.(entry.id!)}
              disabled={ctx.isApproving}
              title="Approve"
              className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
            </button>
            <button 
              onClick={() => ctx.setRejectEntryId?.(entry.id!)}
              title="Reject"
              className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 transition-colors disabled:opacity-50"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        );
      }

      if (!ctx.isApprovalQueue && (entry.status === ProductionStatus.DRAFT || entry.status === ProductionStatus.REJECTED)) {
        return (
          <button 
            onClick={() => ctx.navigate?.(`/production/edit/${entry.id}`)}
            className="inline-flex items-center justify-center h-8 px-3 rounded-md border bg-background hover:bg-muted text-xs font-medium transition-colors whitespace-nowrap mx-auto"
          >
            {/* Note: In a real app we'd import Edit, but to keep dependencies clean here we just render text or simple SVG */}
            {entry.status === ProductionStatus.REJECTED ? 'Fix & Resubmit' : 'Edit'}
          </button>
        );
      }

      return <span className="text-muted-foreground text-xs">—</span>;
    }
  }
];

export const PRODUCTION_LIST_COLUMNS = PRODUCTION_COLUMNS.filter(c => c.id !== 'checkbox');
export const APPROVAL_QUEUE_COLUMNS = PRODUCTION_COLUMNS;
