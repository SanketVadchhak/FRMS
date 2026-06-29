import type { AttendanceFilters, AttendanceRecord } from '@frms/shared';
import { attendanceMock } from '../mocks/attendance.mock';

export const attendanceService = {
  /**
   * Get attendance records (dynamically generated from production).
   */
  async getAttendance(filters: AttendanceFilters): Promise<AttendanceRecord[]> {
    return attendanceMock.getAttendance(filters);
  },

  /**
   * Get dashboard statistics for a specific date.
   */
  async getDashboardStats(date: string) {
    return attendanceMock.getDashboardStats(date);
  },
};
