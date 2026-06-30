import { CheckCircle2 } from 'lucide-react';
import { StatCard } from '@/components/layout/StatCard';
import { useDashboardData } from '../../hooks/useDashboardData';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';

export function KPIApprovalCard() {
  const { kpis, isLoading } = useDashboardData();
  const navigate = useNavigate();

  if (isLoading) {
    return <div className="h-full rounded-xl border bg-card animate-pulse min-h-[120px]" />;
  }

  return (
    <div 
      className="h-full cursor-pointer transition-colors hover:bg-muted/50 rounded-xl"
      onClick={() => navigate(ROUTES.PRODUCTION.LIST, { state: { status: 'PENDING' } })}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(ROUTES.PRODUCTION.LIST, { state: { status: 'PENDING' } });
        }
      }}
      role="button"
      tabIndex={0}
    >
      <StatCard
        title="Pending Approvals"
        value={kpis.pendingApprovalsCount.toString()}
        description="Production entries waiting"
        icon={<CheckCircle2 className="h-4 w-4" />}
        className={`h-full shadow-none ${kpis.pendingApprovalsCount > 0 ? 'bg-amber-500/10 border-amber-200 dark:border-amber-900' : 'border-none bg-transparent'}`}
      />
    </div>
  );
}
