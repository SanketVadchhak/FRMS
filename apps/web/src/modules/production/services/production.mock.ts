import type { ProductionEntry } from '@frms/shared';
import { ProductionStatus } from '@frms/shared';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'frms_production';

export const mockProductionService = {
  getEntries: async (): Promise<ProductionEntry[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  createEntry: async (entry: Omit<ProductionEntry, 'id'>): Promise<ProductionEntry> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const entries = await mockProductionService.getEntries();
    
    // Auto-generate details IDs
    const details = entry.details.map(d => ({
      ...d,
      id: d.id || uuidv4()
    }));

    const newEntry: ProductionEntry = {
      ...entry,
      details,
      id: uuidv4(),
    };
    
    entries.unshift(newEntry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    return newEntry;
  },

  updateEntry: async (id: string, updates: Partial<ProductionEntry>): Promise<ProductionEntry> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const entries = await mockProductionService.getEntries();
    const index = entries.findIndex((e) => e.id === id);
    if (index === -1) throw new Error('Entry not found');

    const entry = entries[index]!;

    // Auto-generate details IDs if not present
    const details = updates.details ? updates.details.map(d => ({
      ...d,
      id: d.id || uuidv4()
    })) : entry.details;

    // Rule: Editing an APPROVED entry reverts it to PENDING
    let newStatus = updates.status || entry.status;
    if (entry.status === ProductionStatus.APPROVED) {
       // If the update itself is not explicitly approving/rejecting it, revert to PENDING
       if (updates.status !== ProductionStatus.APPROVED && updates.status !== ProductionStatus.REJECTED) {
         newStatus = ProductionStatus.PENDING;
       }
    }

    const updatedEntry = { ...entry, ...updates, details, status: newStatus } as ProductionEntry;
    entries[index] = updatedEntry;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    return updatedEntry;
  },

  approveEntry: async (id: string): Promise<ProductionEntry> => {
    return mockProductionService.updateEntry(id, { status: ProductionStatus.APPROVED, rejectionReason: undefined });
  },
  
  rejectEntry: async (id: string, reason: string): Promise<ProductionEntry> => {
    return mockProductionService.updateEntry(id, { status: ProductionStatus.REJECTED, rejectionReason: reason });
  },
};
