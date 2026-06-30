import { dashboardRegistry } from '../registry/dashboardRegistry';
import { KPIProductionCard } from '../components/widgets/KPIProductionCard';
import { KPIMachineCard } from '../components/widgets/KPIMachineCard';
import { KPIApprovalCard } from '../components/widgets/KPIApprovalCard';
import { ChartProductionTrend } from '../components/widgets/ChartProductionTrend';
import { ChartTopEmployees } from '../components/widgets/ChartTopEmployees';
import { RecentActivityFeed } from '../components/widgets/RecentActivityFeed';

let registered = false;

export function registerDashboardWidgets() {
  if (registered) return;
  
  dashboardRegistry.register({
    id: 'kpi-production',
    title: 'Today\'s Production',
    defaultSize: 'sm',
    defaultVisible: true,
    defaultOrder: 0,
    component: KPIProductionCard,
  });

  dashboardRegistry.register({
    id: 'kpi-machines',
    title: 'Active Machines',
    defaultSize: 'sm',
    defaultVisible: true,
    defaultOrder: 1,
    component: KPIMachineCard,
  });

  dashboardRegistry.register({
    id: 'kpi-approvals',
    title: 'Pending Approvals',
    defaultSize: 'sm',
    defaultVisible: true,
    defaultOrder: 2,
    component: KPIApprovalCard,
  });

  dashboardRegistry.register({
    id: 'chart-production',
    title: 'Production Trend',
    defaultSize: 'md',
    defaultVisible: true,
    defaultOrder: 3,
    component: ChartProductionTrend,
  });

  dashboardRegistry.register({
    id: 'chart-employees',
    title: 'Top Employees',
    defaultSize: 'md',
    defaultVisible: true,
    defaultOrder: 4,
    component: ChartTopEmployees,
  });

  dashboardRegistry.register({
    id: 'feed-activity',
    title: 'Recent Activity',
    defaultSize: 'full',
    defaultVisible: true,
    defaultOrder: 5,
    component: RecentActivityFeed,
  });

  registered = true;
}
