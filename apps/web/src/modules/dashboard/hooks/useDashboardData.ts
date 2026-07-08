import { useMemo } from 'react';
import { useProductionEntries } from '../../production/hooks/useProduction';
import { useEmployees } from '../../masters/employees/hooks/useEmployees';
import { ProductionStatus } from '@frms/shared';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';

export interface DashboardAlert {
  id: string;
  severity: 'HIGH' | 'MEDIUM' | 'INFO';
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function useDashboardData() {
  const navigate = useNavigate();
  const { data: rawProductionEntries, isLoading: isLoadingProduction } = useProductionEntries();
  const { data: rawEmployees, isLoading: isLoadingEmployees } = useEmployees();

  const productionEntries = rawProductionEntries || [];
  const employees = rawEmployees || [];

  const isLoading = isLoadingProduction || isLoadingEmployees;

  // 1. Calculate KPIs
  const kpis = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const todayEntries = productionEntries.filter(e => e.date && e.date.split('T')[0] === todayStr);
    const yesterdayEntries = productionEntries.filter(e => e.date && e.date.split('T')[0] === yesterdayStr);
    
    const todayVolume = todayEntries.reduce((sum, e) => sum + (e.productionQuantity || 0), 0);
    const yesterdayVolume = yesterdayEntries.reduce((sum, e) => sum + (e.productionQuantity || 0), 0);
    
    const pendingApprovalsCount = productionEntries.filter(e => e.status === ProductionStatus.PENDING).length;

    // Very naive active machines (just counting unique machines used today)
    const activeMachinesToday = new Set(todayEntries.map(e => e.machineId)).size;
    const activeMachinesYesterday = new Set(yesterdayEntries.map(e => e.machineId)).size;

    return {
      todayVolume,
      yesterdayVolume,
      pendingApprovalsCount,
      activeMachinesToday,
      activeMachinesYesterday,
    };
  }, [productionEntries]);

  // 2. Generate Alerts
  const alerts = useMemo(() => {
    const generatedAlerts: DashboardAlert[] = [];

    if (kpis.pendingApprovalsCount > 0) {
      generatedAlerts.push({
        id: 'pending-approvals',
        severity: kpis.pendingApprovalsCount > 20 ? 'HIGH' : 'MEDIUM',
        title: `${kpis.pendingApprovalsCount} Production Entries Pending Approval`,
        description: 'Review and approve production entries to keep payroll accurate.',
        actionLabel: 'Review',
        onAction: () => navigate(ROUTES.PRODUCTION.LIST, { state: { status: 'PENDING' } }),
      });
    }

    const inactiveEmployees = employees.filter(e => e.status === 'INACTIVE');
    if (inactiveEmployees.length > 0) {
      // Just an example info alert
      generatedAlerts.push({
        id: 'inactive-employees',
        severity: 'INFO',
        title: `${inactiveEmployees.length} Inactive Employees`,
        actionLabel: 'View',
        onAction: () => navigate(ROUTES.MASTERS.EMPLOYEES),
      });
    }

    return generatedAlerts;
  }, [kpis.pendingApprovalsCount, employees, navigate]);

  return {
    kpis,
    alerts,
    isLoading,
    productionEntries,
    employees,
  };
}
