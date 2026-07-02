import { apiClient } from '@/lib/apiClient';

export interface AttendanceFilter {
  date?: string;
  month?: string;
  employeeId?: string;
}

export const attendanceService = {
  getAttendance: async (_filters?: AttendanceFilter) => {
    return apiClient.get<any[]>('/attendance').catch(() => []);
  },

  getDashboardStats: async (_date?: string) => {
    return apiClient.get<any>('/attendance/stats').catch(() => ({
      present: 0,
      absent: 0,
      halfDay: 0,
      late: 0,
    }));
  },
};
