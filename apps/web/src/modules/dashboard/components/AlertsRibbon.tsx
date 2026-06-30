import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useDashboardData } from '../hooks/useDashboardData';

export function AlertsRibbon() {
  const { alerts, isLoading } = useDashboardData();

  if (isLoading || alerts.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 mb-6">
      {alerts.map((alert, idx) => {
        let Icon = Info;
        let colorClasses = 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-900';
        let iconColor = 'text-blue-500';

        if (alert.severity === 'HIGH') {
          Icon = AlertCircle;
          colorClasses = 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-900';
          iconColor = 'text-red-500';
        } else if (alert.severity === 'MEDIUM') {
          Icon = AlertTriangle;
          colorClasses = 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-200 dark:border-yellow-900';
          iconColor = 'text-yellow-500';
        }

        return (
          <div
            key={idx}
            className={`flex items-start gap-3 rounded-lg border p-3 text-sm ${colorClasses}`}
          >
            <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${iconColor}`} />
            <div>
              <p className="font-medium">{alert.title}</p>
              {alert.description && <p className="mt-0.5 opacity-90">{alert.description}</p>}
            </div>
            {alert.actionLabel && alert.onAction && (
              <button
                onClick={alert.onAction}
                className="ml-auto whitespace-nowrap rounded-md bg-background/50 px-3 py-1.5 text-xs font-medium hover:bg-background/80"
              >
                {alert.actionLabel}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
