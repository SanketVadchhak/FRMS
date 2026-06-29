import { useNavigate } from 'react-router-dom';
import { PageHeader, SectionCard, StatCard, StatusBadge } from '@/components';
import { useProductionEntries } from '@/modules/production/hooks/useProduction';
import { useEmployees } from '@/modules/masters/employees/hooks/useEmployees';
import { ClipboardList, Clock, Users, Timer, ChevronRight } from 'lucide-react';
import { ProductionStatus } from '@frms/shared';
import { ROUTES } from '@/constants';
import { formatProductionDate } from '@/utils';

export function DashboardPage() {
  const navigate = useNavigate();
  const { data: entries = [], isLoading: isLoadingEntries } = useProductionEntries();
  const { data: employees = [], isLoading: isLoadingEmployees } = useEmployees();

  const today = new Date().toISOString().split('T')[0];

  const todaysEntries = entries.filter(e => e.date === today);
  const pendingApprovals = entries.filter(e => e.status === ProductionStatus.PENDING);
  const activeEmployees = employees.filter(e => e.status === 'ACTIVE');
  const hoursLoggedToday = todaysEntries.reduce((sum, e) => sum + (e.hoursWorked ?? 0), 0);

  const recentEntries = [...entries]
    .sort((a, b) => {
      const dateA = a.createdAt ?? a.date;
      const dateB = b.createdAt ?? b.date;
      return dateB.localeCompare(dateA);
    })
    .slice(0, 5);

  const isLoading = isLoadingEntries || isLoadingEmployees;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Overview" description="Factory operations at a glance" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 rounded-xl border bg-card animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Overview" description="Factory operations at a glance" />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          title="Today's Entries"
          value={todaysEntries.length}
          icon={<ClipboardList className="h-4 w-4" />}
        />
        <StatCard
          title="Pending Approvals"
          value={pendingApprovals.length}
          icon={<Clock className="h-4 w-4" />}
        />
        <StatCard
          title="Active Employees"
          value={activeEmployees.length}
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          title="Hours Logged Today"
          value={hoursLoggedToday}
          icon={<Timer className="h-4 w-4" />}
        />
      </div>

      {/* Recent Activity */}
      <SectionCard 
        title="Recent Production" 
        description="Latest entries submitted from the factory floor"
        className="overflow-hidden p-0"
      >
        {recentEntries.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No recent activity found.
          </div>
        ) : (
          <div className="divide-y">
            {recentEntries.map((entry) => {
              const emp = employees.find(e => e.id === entry.employeeId);
              
              return (
                <div 
                  key={entry.id}
                  onClick={() => navigate(ROUTES.PRODUCTION.LIST)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(ROUTES.PRODUCTION.LIST);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className="flex items-center justify-between p-4 hover:bg-muted/40 transition-colors cursor-pointer focus-visible:outline-none focus-visible:bg-muted/40"
                >
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
                    <span className="font-medium text-sm w-32 truncate">
                      {emp?.name ?? entry.employeeId}
                    </span>
                    <span className="text-sm text-muted-foreground w-24">
                      {entry.productionQuantity} pcs
                    </span>
                    <StatusBadge status={entry.status} />
                  </div>
                  
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span className="text-xs hidden sm:inline-block">
                      {formatProductionDate(entry.date)}
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
