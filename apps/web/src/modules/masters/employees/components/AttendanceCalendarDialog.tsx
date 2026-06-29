import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useAttendanceRecords } from '@/modules/attendance/hooks/useAttendance';
import type { Employee } from '@frms/shared';
import { AttendanceStatus } from '@frms/shared';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/utils/cn';

interface AttendanceCalendarDialogProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AttendanceCalendarDialog({ employee, isOpen, onClose }: AttendanceCalendarDialogProps) {
  const navigate = useNavigate();
  
  // State for the currently viewed month (defaults to current month)
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date();
    d.setDate(1); // Set to first of the month
    return d;
  });

  // Calculate start and end dates for the API request to limit fetched data
  const { startDate, endDate } = useMemo(() => {
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0); // Last day of month
    
    // Format to YYYY-MM-DD
    const formatDateStr = (d: Date) => d.toISOString().split('T')[0];
    
    return {
      startDate: formatDateStr(start),
      endDate: formatDateStr(end),
    };
  }, [currentDate]);

  const { data: attendanceRecords } = useAttendanceRecords({
    startDate,
    endDate,
    employeeId: employee?.id,
  });

  const nextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  // Generate calendar grid array
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    
    // Pad empty slots before the 1st of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    // Add actual days
    for (let i = 1; i <= daysInMonth; i++) {
      // Create local date string safely avoiding timezone shifts
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        day: i,
        dateString
      });
    }
    
    return days;
  }, [currentDate]);

  const handleDayClick = (dateString: string, isPresent: boolean) => {
    if (!isPresent || !employee) return;
    
    // Navigate to Production List filtered for this employee and date
    navigate(`${ROUTES.PRODUCTION.LIST}?employeeId=${employee.id}&date=${dateString}`);
    onClose();
  };

  if (!employee) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg md:w-full">
          <div className="flex flex-col space-y-1.5 text-center sm:text-left">
            <Dialog.Title className="text-lg font-semibold leading-none tracking-tight">Attendance History</Dialog.Title>
            <p className="text-sm text-muted-foreground">{employee.name}</p>
          </div>

          <Dialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Dialog.Close>

        <div className="mt-4 flex items-center justify-between">
          <button 
            onClick={prevMonth}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <h4 className="font-medium text-sm">
            {currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
          </h4>
          
          <button 
            onClick={nextMonth}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4">
          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <div key={d} className="text-xs font-medium text-muted-foreground">{d}</div>
            ))}
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((dayObj, i) => {
              if (!dayObj) {
                // Empty padding cell
                return <div key={`empty-${i}`} className="h-10 w-full" />;
              }

              const isBeforeJoining = dayObj.dateString < employee.joiningDate;
              // Employee is considered inactive if they have an INACTIVE status (we could also check a deactivationDate if we had one, but for now we'll just not color inactive)
              const isInactive = employee.status === 'INACTIVE';
              
              // Find attendance record for this day
              const record = attendanceRecords?.find(r => r.date === dayObj.dateString);
              const isPresent = record?.status === AttendanceStatus.PRESENT;

              // Apply colors:
              // - Disabled/Gray if before joining date
              // - White if inactive or absent or no production
              // - Green if present (production exists)
              
              const isClickable = isPresent && !isInactive;

              return (
                <button
                  key={dayObj.dateString}
                  disabled={!isClickable}
                  onClick={() => handleDayClick(dayObj.dateString, isPresent)}
                  className={cn(
                    "h-10 w-full rounded flex items-center justify-center text-sm transition-colors",
                    isBeforeJoining 
                      ? "opacity-30 cursor-default" 
                      : isInactive || !isPresent
                        ? "bg-background text-foreground border cursor-default"
                        : "bg-emerald-500 text-white hover:bg-emerald-600 cursor-pointer shadow-sm"
                  )}
                  title={
                    isBeforeJoining ? 'Before Joining Date' :
                    isPresent ? 'Present (Click to view production)' : 'Absent'
                  }
                >
                  {dayObj.day}
                </button>
              );
            })}
          </div>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
  );
}
