import { useQuery } from '@tanstack/react-query';
import { attendanceService } from '@/services/api/attendance.service';
import type { AttendanceFilters } from '@frms/shared';
import { QUERY_KEYS } from '@/constants/query-keys';

export function useAttendanceRecords(filters: AttendanceFilters) {
  return useQuery({
    queryKey: [QUERY_KEYS.ATTENDANCE, filters],
    queryFn: () => attendanceService.getAttendance(filters),
  });
}

export function useAttendanceStats(date: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.ATTENDANCE, 'stats', date],
    queryFn: () => attendanceService.getDashboardStats(date),
  });
}
