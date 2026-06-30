import { Factory } from 'lucide-react';
import { StatCard } from '@/components/layout/StatCard';
import { useDashboardData } from '../../hooks/useDashboardData';

export function KPIProductionCard() {
  const { kpis, isLoading } = useDashboardData();

  if (isLoading) {
    return <div className="h-full rounded-xl border bg-card animate-pulse min-h-[120px]" />;
  }

  return (
    <StatCard
      title="Today's Production"
      value={kpis.todayVolume.toLocaleString()}
      description="Units produced today"
      icon={<Factory className="h-4 w-4" />}
      trend={{ value: kpis.yesterdayVolume, label: 'produced yesterday', isPositive: kpis.todayVolume >= kpis.yesterdayVolume }}
      className="h-full border-none shadow-none"
    />
  );
}
