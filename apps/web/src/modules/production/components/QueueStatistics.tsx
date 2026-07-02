import { useMemo } from 'react';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';
import { StatCard } from '@/components';
import { useProductionEntries } from '../hooks/useProduction';
import { ProductionStatus } from '@frms/shared';

export function QueueStatistics() {
  const { data: rawEntries } = useProductionEntries();
  const entries = rawEntries || [];

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0] || '', []);

  const stats = useMemo(() => {
    return {
      pendingApprovals: entries.filter((e) => e.status === ProductionStatus.PENDING).length,
      submittedToday: entries.filter((e) => e.createdAt?.startsWith(todayStr)).length,
      approvedToday: entries.filter((e) => e.status === ProductionStatus.APPROVED && e.approvedAt?.startsWith(todayStr)).length,
      rejectedToday: entries.filter((e) => e.status === ProductionStatus.REJECTED && e.updatedAt?.startsWith(todayStr)).length,
    };
  }, [entries, todayStr]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      <StatCard
        title="Pending Approvals"
        value={stats.pendingApprovals}
        icon={<Clock className="h-4 w-4" />}
      />
      <StatCard
        title="Submitted Today"
        value={stats.submittedToday}
        icon={<CheckCircle2 className="h-4 w-4" />}
      />
      <StatCard
        title="Approved Today"
        value={stats.approvedToday}
        icon={<CheckCircle2 className="h-4 w-4" />}
      />
      <StatCard
        title="Rejected Today"
        value={stats.rejectedToday}
        icon={<XCircle className="h-4 w-4" />}
      />
    </div>
  );
}
