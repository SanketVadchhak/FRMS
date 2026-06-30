import { useState, useRef, useEffect } from 'react';
import { Bell, ClipboardCheck, Clock, Banknote, HardHat, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { ROUTES } from '@/constants';
import { useProductionEntries } from '@/modules/production/hooks/useProduction';
import { useEmployees } from '@/modules/masters/employees/hooks/useEmployees';
import { useMachines } from '@/modules/masters/machines/hooks/useMachines';
import { ProductionStatus } from '@frms/shared';
import { formatDistanceToNow, isLastDayOfMonth } from 'date-fns';

type NotificationItem = {
  id: string;
  title: string;
  message: React.ReactNode;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  timestamp?: Date;
  onClick: () => void;
};

export function NotificationMenu() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Track dismissed notifications
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('frms_dismissed_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleDismiss = (id: string) => {
    setDismissedIds(prev => {
      const next = [...prev, id];
      localStorage.setItem('frms_dismissed_notifications', JSON.stringify(next));
      return next;
    });
  };

  const { data: entries = [] } = useProductionEntries();
  const { data: employees = [] } = useEmployees();
  const { data: machines = [] } = useMachines();

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications: NotificationItem[] = [];
  const now = new Date();

  // 1. Pending Approvals
  const pendingEntries = entries.filter((e) => e.status === ProductionStatus.PENDING);
  pendingEntries.forEach(entry => {
    const emp = employees.find(e => e.id === entry.employeeId);
    const empName = emp?.name || entry.employeeId;
    notifications.push({
      id: `pending-${entry.id}`,
      title: 'Production Approval Required',
      message: <>New production entry submitted by <span className="font-medium text-foreground">{empName}</span>.</>,
      icon: <ClipboardCheck className="h-4 w-4" />,
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-600',
      timestamp: entry.createdAt ? new Date(entry.createdAt) : undefined,
      onClick: () => {
        setIsOpen(false);
        navigate(ROUTES.PRODUCTION.APPROVAL);
      }
    });
  });

  // 2. Salary Reminder
  if (isLastDayOfMonth(now)) {
    const monthKey = `${now.getFullYear()}-${now.getMonth()}`;
    notifications.push({
      id: `salary-reminder-${monthKey}`,
      title: 'Monthly Salary Processing',
      message: 'Today is the last day of the month. Please generate and process employee payrolls.',
      icon: <Banknote className="h-4 w-4" />,
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-600',
      timestamp: now,
      onClick: () => {
        setIsOpen(false);
        navigate(ROUTES.PAYROLL.GENERATE);
      }
    });
  }

  // 3. Inactive Employees & Machines
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0]!;
  
  const recentEntries = entries.filter(e => e.date >= sevenDaysAgoStr);
  const activeEmployeeIds = new Set(recentEntries.map(e => e.employeeId));
  const activeMachineIds = new Set(recentEntries.map(e => e.machineId));

  const inactiveEmployees = employees.filter(emp => !activeEmployeeIds.has(emp.id!));
  const inactiveMachines = machines.filter(mac => !activeMachineIds.has(mac.id!));

  if (inactiveEmployees.length > 0) {
    notifications.push({
      id: `inactive-employees-${sevenDaysAgoStr}`,
      title: 'Inactive Employees',
      message: <><span className="font-medium text-foreground">{inactiveEmployees.length}</span> employees have logged no production in the last 7 days.</>,
      icon: <HardHat className="h-4 w-4" />,
      iconBg: 'bg-red-500/10',
      iconColor: 'text-red-600',
      timestamp: now,
      onClick: () => {
        setIsOpen(false);
        navigate(ROUTES.MASTERS.EMPLOYEES);
      }
    });
  }

  if (inactiveMachines.length > 0) {
    notifications.push({
      id: `inactive-machines-${sevenDaysAgoStr}`,
      title: 'Idle Machines',
      message: <><span className="font-medium text-foreground">{inactiveMachines.length}</span> machines have been inactive for the last 7 days.</>,
      icon: <Cpu className="h-4 w-4" />,
      iconBg: 'bg-orange-500/10',
      iconColor: 'text-orange-600',
      timestamp: now,
      onClick: () => {
        setIsOpen(false);
        navigate(ROUTES.MASTERS.MACHINES);
      }
    });
  }

  // Filter out dismissed notifications
  const activeNotifications = notifications.filter(n => !dismissedIds.includes(n.id));

  // Sort active notifications by timestamp descending
  activeNotifications.sort((a, b) => {
    const dateA = a.timestamp ? a.timestamp.getTime() : 0;
    const dateB = b.timestamp ? b.timestamp.getTime() : 0;
    return dateB - dateA;
  });

  const hasNotifications = activeNotifications.length > 0;

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring",
          isOpen && "bg-muted text-foreground"
        )}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {hasNotifications && (
          <span className="absolute top-1 right-1 flex h-2.5 w-2.5 rounded-full bg-destructive border-2 border-card" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border bg-card shadow-xl ring-1 ring-black/5 z-50 overflow-hidden flex flex-col max-h-[80vh]">
          <div className="px-4 py-3 border-b bg-muted/20 flex items-center justify-between shrink-0">
            <h3 className="font-semibold text-sm">Notifications</h3>
            {hasNotifications && (
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                {activeNotifications.length} new
              </span>
            )}
          </div>
          
          <div className="overflow-y-auto overscroll-contain">
            {!hasNotifications ? (
              <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center">
                  <Bell className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {activeNotifications.map((item) => {
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        handleDismiss(item.id);
                        item.onClick();
                      }}
                      className="w-full text-left p-4 hover:bg-muted/50 transition-colors flex gap-3 items-start group"
                    >
                      <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform", item.iconBg, item.iconColor)}>
                        {item.icon}
                      </div>
                      <div className="space-y-1 flex-1 min-w-0">
                        <p className="text-sm font-medium leading-tight">{item.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {item.message}
                        </p>
                        {item.timestamp && (
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground pt-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          
          {hasNotifications && (
            <div className="p-2 border-t bg-muted/10 shrink-0">
              <button 
                onClick={() => {
                  setIsOpen(false);
                  navigate(ROUTES.NOTIFICATIONS || '/');
                }}
                className="w-full py-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
