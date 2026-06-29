import { useMemo } from 'react';
import type { ProductionEntry, Employee } from '@frms/shared';
import { ProductionStatus } from '@frms/shared';

export interface ProductionFilters {
  search: string;
  fromDate: string;
  toDate: string;
  employeeId: string;
  status: string;
  
  // Advanced
  minQty: string;
  maxQty: string;
  minHours: string;
  maxHours: string;
  minBonus: string;
  maxBonus: string;
  submittedBy: string;
  approvedBy: string;
  hasNotes: boolean;
  previouslyRejected: boolean;
}

export const defaultProductionFilters: ProductionFilters = {
  search: '',
  fromDate: '',
  toDate: '',
  employeeId: 'ALL',
  status: 'ALL',
  minQty: '',
  maxQty: '',
  minHours: '',
  maxHours: '',
  minBonus: '',
  maxBonus: '',
  submittedBy: 'ALL',
  approvedBy: 'ALL',
  hasNotes: false,
  previouslyRejected: false,
};

export function useFilteredProductionEntries(
  entries: ProductionEntry[],
  filters: ProductionFilters,
  employees: Employee[]
) {
  return useMemo(() => {
    // 1. Sort newest first
    const sorted = [...entries].sort((a, b) => {
      const dateA = a.createdAt ?? a.date;
      const dateB = b.createdAt ?? b.date;
      return dateB.localeCompare(dateA);
    });

    let activeFilterCount = 0;

    // Count active filters (excluding default values)
    if (filters.search) activeFilterCount++;
    if (filters.fromDate) activeFilterCount++;
    if (filters.toDate) activeFilterCount++;
    if (filters.employeeId !== 'ALL') activeFilterCount++;
    if (filters.status !== 'ALL' && filters.status !== 'PENDING_OR_REJECTED') activeFilterCount++; // Assuming PENDING_OR_REJECTED is default for approval queue
    if (filters.minQty) activeFilterCount++;
    if (filters.maxQty) activeFilterCount++;
    if (filters.minHours) activeFilterCount++;
    if (filters.maxHours) activeFilterCount++;
    if (filters.minBonus) activeFilterCount++;
    if (filters.maxBonus) activeFilterCount++;
    if (filters.submittedBy !== 'ALL') activeFilterCount++;
    if (filters.approvedBy !== 'ALL') activeFilterCount++;
    if (filters.hasNotes) activeFilterCount++;
    if (filters.previouslyRejected) activeFilterCount++;

    // 2. Filter
    const filtered = sorted.filter((entry) => {
      const emp = employees.find((e) => e.id === entry.employeeId);
      
      // Search
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const designNames = entry.details?.map(d => d.designName).join(' ').toLowerCase() || '';
        const match = 
          emp?.name.toLowerCase().includes(query) ||
          designNames.includes(query) ||
          entry.notes?.toLowerCase().includes(query) ||
          (entry.createdBy && entry.createdBy.toLowerCase().includes(query));
        if (!match) return false;
      }

      // Dates
      if (filters.fromDate && entry.date < filters.fromDate) return false;
      if (filters.toDate && entry.date > filters.toDate) return false;

      // Selects
      if (filters.employeeId !== 'ALL' && entry.employeeId !== filters.employeeId) return false;
      
      // Status
      if (filters.status !== 'ALL') {
        if (filters.status === 'PENDING_OR_REJECTED') {
          if (entry.status !== ProductionStatus.PENDING && entry.status !== ProductionStatus.REJECTED) return false;
        } else {
          if (entry.status !== filters.status) return false;
        }
      }

      // Advanced - Numbers
      if (filters.minQty && (entry.productionQuantity ?? 0) < Number(filters.minQty)) return false;
      if (filters.maxQty && (entry.productionQuantity ?? 0) > Number(filters.maxQty)) return false;
      if (filters.minHours && (entry.hoursWorked ?? 0) < Number(filters.minHours)) return false;
      if (filters.maxHours && (entry.hoursWorked ?? 0) > Number(filters.maxHours)) return false;
      if (filters.minBonus && (entry.bonus ?? 0) < Number(filters.minBonus)) return false;
      if (filters.maxBonus && (entry.bonus ?? 0) > Number(filters.maxBonus)) return false;

      // Advanced - Strings & Bools
      if (filters.submittedBy !== 'ALL' && entry.createdBy !== filters.submittedBy) return false;
      if (filters.approvedBy !== 'ALL' && entry.approvedBy !== filters.approvedBy) return false;
      if (filters.hasNotes && !entry.notes) return false;
      
      if (filters.previouslyRejected && entry.status !== ProductionStatus.REJECTED) return false;

      return true;
    });

    return {
      filteredEntries: filtered,
      activeFilterCount,
      recordCount: filtered.length
    };
  }, [entries, filters, employees]);
}
