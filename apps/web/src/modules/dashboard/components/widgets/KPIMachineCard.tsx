import { Settings } from 'lucide-react';
import { StatCard } from '@/components/layout/StatCard';
import { useDashboardData } from '../../hooks/useDashboardData';

export function KPIMachineCard() {
  const { kpis, isLoading } = useDashboardData();

  if (isLoading) {
    return <div className="h-full rounded-xl border bg-card animate-pulse min-h-[120px]" />;
  }

  return (
    <StatCard
      title="Active Machines"
      value={kpis.activeMachinesToday.toString()}
      description="Machines running today"
      icon={<Settings className="h-4 w-4" />}
      trend={{ value: kpis.activeMachinesYesterday, label: 'machines active yesterday', isPositive: kpis.activeMachinesToday >= kpis.activeMachinesYesterday }}
      className="h-full border-none shadow-none"
    />
  );
}
