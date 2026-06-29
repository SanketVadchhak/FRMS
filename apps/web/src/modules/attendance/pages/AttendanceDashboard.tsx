import { useState } from 'react';
import { PageHeader, StatCard, ErrorState } from '@/components';
import { useAttendanceStats } from '../hooks/useAttendance';
import { Users, UserX, Clock, ClipboardList } from 'lucide-react';

export function AttendanceDashboard() {
  const today = new Date().toISOString().split('T')[0] as string;
  const [date, setDate] = useState(today);

  const { data: stats, isError, refetch } = useAttendanceStats(date || today);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Attendance Dashboard" 
        description="Daily overview of workforce presence derived from production"
        action={
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Date:</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        }
      />

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Present Today"
            value={stats?.presentToday.toString() || '0'}
            icon={<Users className="h-4 w-4 text-emerald-500" />}
          />
          <StatCard
            title="Absent Today"
            value={stats?.absentToday.toString() || '0'}
            icon={<UserX className="h-4 w-4 text-destructive" />}
          />
          <StatCard
            title="Employees Worked"
            value={stats?.totalEmployees.toString() || '0'}
            icon={<ClipboardList className="h-4 w-4 text-primary" />}
          />
          <StatCard
            title="Production Hours"
            value={stats ? `${stats.totalProductionHours.toFixed(1)} hrs` : '0 hrs'}
            icon={<Clock className="h-4 w-4 text-blue-500" />}
          />
        </div>
      )}
    </div>
  );
}
