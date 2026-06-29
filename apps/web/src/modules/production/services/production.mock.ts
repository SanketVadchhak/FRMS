import type { ProductionEntry } from '@frms/shared';
import { ProductionStatus, ShiftType } from '@frms/shared';
import { v4 as uuidv4 } from 'uuid';
import { STORAGE_KEYS } from '@/constants';

const now = () => new Date().toISOString();

// ─── Seed Data ────────────────────────────────────────────────────────────────
// Used on first run or after a schema-breaking migration.
const SEED_ENTRIES: ProductionEntry[] = [
  {
    id: uuidv4(),
    date: new Date().toISOString().split('T')[0] as string,
    employeeId: 'emp_1',
    machineId: 'm1',
    shift: ShiftType.DAY,
    details: [{ id: uuidv4(), designName: 'ABC Floral Logo', totalStitches: 12400 }],
    productionQuantity: 48,
    hoursWorked: 8,
    framesChanged: 2,
    threadBreakage: 1,
    bonus: 0,
    notes: 'Normal shift. No issues.',
    status: ProductionStatus.PENDING,
    createdAt: now(),
    updatedAt: now(),
    createdBy: 'operator1',
  },
  {
    id: uuidv4(),
    date: new Date().toISOString().split('T')[0] as string,
    employeeId: 'emp_2',
    machineId: 'm2',
    shift: ShiftType.DAY,
    details: [
      { id: uuidv4(), designName: 'Rose Border Patch', totalStitches: 8500 },
      { id: uuidv4(), designName: 'Corporate Logo', totalStitches: 5200 },
    ],
    productionQuantity: 60,
    hoursWorked: 8.5,
    framesChanged: 4,
    threadBreakage: 3,
    bonus: 50,
    notes: '',
    status: ProductionStatus.APPROVED,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 80000000).toISOString(),
    createdBy: 'operator1',
    approvedAt: new Date(Date.now() - 78000000).toISOString(),
    approvedBy: 'supervisor1',
  },
  {
    id: uuidv4(),
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0] as string,
    employeeId: 'emp_1',
    machineId: 'm1',
    shift: ShiftType.NIGHT,
    details: [{ id: uuidv4(), designName: 'Star Cluster Design', totalStitches: 9800 }],
    productionQuantity: 35,
    hoursWorked: 7,
    framesChanged: 1,
    threadBreakage: 0,
    bonus: 0,
    notes: 'Machine stopped briefly for thread replacement.',
    status: ProductionStatus.DRAFT,
    createdAt: new Date(Date.now() - 90000000).toISOString(),
    updatedAt: new Date(Date.now() - 90000000).toISOString(),
    createdBy: 'operator1',
  },
];

// ─── Storage Helpers ──────────────────────────────────────────────────────────
function getEntries(): ProductionEntry[] {
  const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTION);
  if (!raw) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTION, JSON.stringify(SEED_ENTRIES));
    return SEED_ENTRIES;
  }
  return JSON.parse(raw) as ProductionEntry[];
}

function saveEntries(entries: ProductionEntry[]): void {
  localStorage.setItem(STORAGE_KEYS.PRODUCTION, JSON.stringify(entries));
}

const delay = (ms = 400) => new Promise<void>((r) => setTimeout(r, ms));

// ─── Mock Service ─────────────────────────────────────────────────────────────
export const mockProductionService = {
  getEntries: async (): Promise<ProductionEntry[]> => {
    await delay(300);
    return getEntries();
  },

  createEntry: async (
    entry: Omit<ProductionEntry, 'id' | 'createdAt' | 'updatedAt'>,
    createdBy?: string,
  ): Promise<ProductionEntry> => {
    await delay();
    const entries = getEntries();

    const newEntry: ProductionEntry = {
      ...entry,
      id: uuidv4(),
      details: entry.details.map((d) => ({ ...d, id: d.id ?? uuidv4() })),
      createdAt: now(),
      updatedAt: now(),
      createdBy: createdBy ?? 'system',
    };

    saveEntries([newEntry, ...entries]);
    return newEntry;
  },

  updateEntry: async (
    id: string,
    updates: Partial<ProductionEntry>,
    updatedBy?: string,
  ): Promise<ProductionEntry> => {
    await delay();
    const entries = getEntries();
    const index = entries.findIndex((e) => e.id === id);
    if (index === -1) throw new Error(`Production entry "${id}" not found`);

    const existing = entries[index]!;

    // Editing an APPROVED entry reverts it to PENDING (requires re-approval)
    let effectiveStatus = updates.status ?? existing.status;
    if (
      existing.status === ProductionStatus.APPROVED &&
      updates.status !== ProductionStatus.APPROVED &&
      updates.status !== ProductionStatus.REJECTED
    ) {
      effectiveStatus = ProductionStatus.PENDING;
    }

    const updatedEntry: ProductionEntry = {
      ...existing,
      ...updates,
      details: updates.details
        ? updates.details.map((d) => ({ ...d, id: d.id ?? uuidv4() }))
        : existing.details,
      status: effectiveStatus,
      updatedAt: now(),
      updatedBy: updatedBy ?? 'system',
    };

    entries[index] = updatedEntry;
    saveEntries(entries);
    return updatedEntry;
  },

  bulkApproveEntries: async (ids: string[], approvedBy: string): Promise<boolean> => {
    await delay();
    const entries = getEntries();
    
    let updatedCount = 0;
    const updatedEntries = entries.map(entry => {
      if (ids.includes(entry.id!) && entry.status === ProductionStatus.PENDING) {
        updatedCount++;
        return {
          ...entry,
          status: ProductionStatus.APPROVED,
          approvedAt: now(),
          approvedBy,
          updatedAt: now(),
        };
      }
      return entry;
    });

    if (updatedCount > 0) {
      saveEntries(updatedEntries);
    }
    
    return true;
  },

  approveEntry: async (id: string, approvedBy = 'supervisor'): Promise<ProductionEntry> => {
    return mockProductionService.updateEntry(id, {
      status: ProductionStatus.APPROVED,
      rejectionReason: undefined,
      approvedAt: now(),
      approvedBy,
    });
  },

  rejectEntry: async (id: string, reason: string, rejectedBy = 'supervisor'): Promise<ProductionEntry> => {
    return mockProductionService.updateEntry(id, {
      status: ProductionStatus.REJECTED,
      rejectionReason: reason,
      updatedBy: rejectedBy,
    });
  },
};
