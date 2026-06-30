import { useMemo } from 'react';
import { useDashboardData } from '../../hooks/useDashboardData';
import { formatDistanceToNow } from 'date-fns';

export function RecentActivityFeed() {
  const { productionEntries, employees, isLoading } = useDashboardData();

  const activities = useMemo(() => {
    const items: Array<{ id: string; type: string; message: string; timestamp: Date; user: string }> = [];

    // Production Approvals
    const approved = productionEntries.filter(e => e.status === 'APPROVED' && e.approvedAt);
    approved.forEach(e => {
      items.push({
        id: `prod-app-${e.id}`,
        type: 'approval',
        message: `Production entry approved`,
        timestamp: new Date(e.approvedAt!),
        user: e.approvedBy || 'System',
      });
    });

    // New Employees
    employees.forEach(e => {
      if (e.createdAt) {
        items.push({
          id: `emp-new-${e.id}`,
          type: 'employee',
          message: `New employee ${e.name} added`,
          timestamp: new Date(e.createdAt),
          user: 'System',
        });
      }
    });

    // Sort by newest
    return items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 5);
  }, [productionEntries, employees]);

  if (isLoading) {
    return <div className="h-full w-full animate-pulse bg-muted rounded-xl" />;
  }

  return (
    <div className="flex flex-col h-full p-6">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">Recent Activity</h3>
      
      {activities.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
          No recent activity
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map(activity => (
            <div key={activity.id} className="flex gap-3 text-sm">
              <div className="flex flex-col items-center">
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                <div className="w-px h-full bg-border mt-1" />
              </div>
              <div className="flex-1 pb-2">
                <p className="font-medium">{activity.message}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(activity.timestamp, { addSuffix: true })} by {activity.user}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
