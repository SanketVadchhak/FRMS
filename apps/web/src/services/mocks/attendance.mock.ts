import { STORAGE_KEYS } from '@/constants';
import type { AttendanceRecord, AttendanceFilters, Employee, ProductionEntry } from '@frms/shared';
import { AttendanceStatus } from '@frms/shared';
import { getStorageItem } from '@/utils/storage';

export const attendanceMock = {
  /**
   * Dynamically generate attendance records for a specific date (or date range)
   * by joining active Employees with Production Entries.
   */
  async getAttendance(filters: AttendanceFilters): Promise<AttendanceRecord[]> {
    // 1. Fetch all active employees
    const employees = getStorageItem<Employee[]>(STORAGE_KEYS.EMPLOYEES, []);
    const activeEmployees = employees.filter(e => e.status === 'ACTIVE');

    // 2. Fetch all production entries
    const productionEntries = getStorageItem<ProductionEntry[]>(STORAGE_KEYS.PRODUCTION, []);

    // 3. Filter production entries by date range if provided
    let relevantEntries = productionEntries;
    
    // For V1, we usually query a specific date or a narrow range
    if (filters.date) {
      relevantEntries = relevantEntries.filter(entry => entry.date === filters.date);
    } else {
      if (filters.startDate) {
        relevantEntries = relevantEntries.filter(entry => entry.date >= filters.startDate!);
      }
      if (filters.endDate) {
        relevantEntries = relevantEntries.filter(entry => entry.date <= filters.endDate!);
      }
    }

    if (filters.employeeId) {
      relevantEntries = relevantEntries.filter(entry => entry.employeeId === filters.employeeId);
    }

    // 4. Determine unique dates to report on based on the filters.
    // If a specific date is given, we just report for that date.
    // If a range is given (or no date), we report for dates that have production.
    // Alternatively, to show "Absent" for days with zero production, we must explicitly iterate days.
    // Since this is a mock and generating for "all time" is expensive, we'll assume filters.date is the primary use case.
    const targetDates = filters.date ? [filters.date] : [...new Set(relevantEntries.map(e => e.date))];

    const records: AttendanceRecord[] = [];

    // 5. Generate attendance for each target date
    for (const targetDate of targetDates) {
      const dateEntries = relevantEntries.filter(e => e.date === targetDate);

      for (const employee of activeEmployees) {
        if (filters.employeeId && employee.id !== filters.employeeId) continue;

        const employeeEntries = dateEntries.filter(e => e.employeeId === employee.id);

        const isPresent = employeeEntries.length > 0;
        
        let totalQuantity = 0;
        let totalWorkingHours = 0;
        
        for (const entry of employeeEntries) {
          totalQuantity += entry.quantity || 0;
          totalWorkingHours += entry.hours || 0;
        }

        records.push({
          id: `att_${employee.id}_${targetDate}`,
          date: targetDate,
          employeeId: employee.id,
          employeeName: employee.name,
          status: isPresent ? AttendanceStatus.PRESENT : AttendanceStatus.ABSENT,
          totalEntries: employeeEntries.length,
          totalQuantity,
          totalWorkingHours,
          // First and Last entry times are not directly tracked in the base production model yet (we use 'hours'), 
          // so we'll leave them undefined for now or we could derive them if we had timestamps.
        });
      }
    }

    // 6. Apply final status filter if requested
    let finalRecords = records;
    if (filters.status) {
      finalRecords = finalRecords.filter(r => r.status === filters.status);
    }

    // Sort by date DESC, then name ASC
    return finalRecords.sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return a.employeeName.localeCompare(b.employeeName);
    });
  },

  async getDashboardStats(date: string) {
    const records = await this.getAttendance({ date });
    
    let present = 0;
    let absent = 0;
    let totalHours = 0;

    for (const record of records) {
      if (record.status === AttendanceStatus.PRESENT) {
        present++;
      } else {
        absent++;
      }
      totalHours += record.totalWorkingHours;
    }

    return {
      presentToday: present,
      absentToday: absent,
      totalEmployees: present + absent,
      totalProductionHours: totalHours,
    };
  }
};
