import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { useProductionEntries, useCreateProductionEntry, useUpdateProductionEntry } from '../hooks/useProduction';
import { useEmployees } from '@/modules/masters/employees/hooks/useEmployees';
import { useMachines } from '@/modules/masters/machines/hooks/useMachines';
import type { ProductionEntry as IProductionEntry, ProductionDetail } from '@frms/shared';
import { ShiftType, ProductionStatus } from '@frms/shared';
import { ROUTES } from '@/constants';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';

export function ProductionEntry() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const { data: entries } = useProductionEntries();
  const { data: employees = [] } = useEmployees();
  const { data: machines = [] } = useMachines();

  const createMutation = useCreateProductionEntry();
  const updateMutation = useUpdateProductionEntry();

  // Setup State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [employeeId, setEmployeeId] = useState('');
  const [machineId, setMachineId] = useState('');
  const [shift, setShift] = useState<ShiftType>(ShiftType.DAY);

  // Sessions State
  const [sessions, setSessions] = useState<{ designName: string; stitches: number }[]>([
    { designName: '', stitches: 0 }
  ]);

  // Production State
  const [productionQuantity, setProductionQuantity] = useState<number>(0);
  const [hoursWorked, setHoursWorked] = useState<number | ''>('');

  // Shift Metrics State
  const [framesChanged, setFramesChanged] = useState<number>(0);
  const [threadBreakage, setThreadBreakage] = useState<number>(0);
  const [bonus, setBonus] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (isEditing && entries) {
      const entry = entries.find((e) => e.id === id);
      if (entry) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDate(entry.date);
        setEmployeeId(entry.employeeId);
        setMachineId(entry.machineId);
        setShift(entry.shift);

        let parsedStitches: { stitches: number }[] = [];
        let parsedNotes = '';
        try {
          if (entry.notes) {
            const parsed = JSON.parse(entry.notes);
            if (parsed.sessions) {
              parsedStitches = parsed.sessions;
              parsedNotes = parsed.text || '';
              setHoursWorked(parsed.hoursWorked || '');
            } else {
              parsedNotes = entry.notes;
            }
          }
        } catch {
          parsedNotes = entry.notes || '';
        }

        setNotes(parsedNotes);
        setFramesChanged(entry.framesChanged || 0);
        setThreadBreakage(entry.threadBreakage || 0);
        setBonus(entry.bonus || 0);

        if (entry.details.length > 0) {
          setSessions(entry.details.map((d, i) => ({
            designName: d.designId,
            stitches: parsedStitches[i]?.stitches || 0
          })));
          setProductionQuantity(entry.details[0]?.completedPieces || 0);
        }
      }
    }
  }, [isEditing, id, entries]);

  const handleAddSession = () => {
    if (sessions.length >= 2) return;
    setSessions([...sessions, { designName: '', stitches: 0 }]);
  };

  const handleRemoveSession = (index: number) => {
    setSessions(sessions.filter((_, idx) => idx !== index));
  };

  const handleSessionChange = (index: number, field: 'designName' | 'stitches', value: string | number) => {
    const newSessions = [...sessions];
    newSessions[index] = { ...newSessions[index], [field]: value } as { designName: string; stitches: number };
    setSessions(newSessions);
  };

  const handleSave = (status: ProductionStatus) => {
    // Basic validation
    if (!employeeId || !machineId || sessions.length === 0) {
      alert('Please fill in Employee, Machine, and at least one Session.');
      return;
    }
    const invalidSession = sessions.find(s => !s.designName);
    if (invalidSession) {
      alert('Please complete all session details (Design Name).');
      return;
    }
    
    if (hoursWorked === '' || hoursWorked < 0.5 || hoursWorked > 24) {
      alert('Please enter a valid number of Hours Worked (between 0.5 and 24).');
      return;
    }

    // Map UI state back to schema payload without modifying schemas
    const payloadDetails: ProductionDetail[] = sessions.map((s, idx) => ({
      designId: s.designName,
      completedPieces: idx === 0 ? productionQuantity : 0, // Store total production in first detail
      rejectedPieces: 0,
      startTime: '00:00', // Dummy valid HH:mm
      endTime: '00:00',   // Dummy valid HH:mm
    }));

    const notesPayload = JSON.stringify({
      text: notes,
      hoursWorked: Number(hoursWorked),
      sessions: sessions.map(s => ({ stitches: s.stitches }))
    });

    const payload = {
      date,
      employeeId,
      machineId,
      shift,
      framesChanged,
      threadBreakage,
      bonus,
      notes: notesPayload, // Storing stitches metadata in notes to preserve schema
      status,
      details: payloadDetails,
    } as Omit<IProductionEntry, 'id'>;

    if (isEditing) {
      updateMutation.mutate({ id: id!, updates: payload }, {
        onSuccess: () => navigate(ROUTES.PRODUCTION.LIST)
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => navigate(ROUTES.PRODUCTION.LIST)
      });
    }
  };

  const employeeOptions = employees.map(e => ({ value: e.id!, label: e.name }));
  const machineOptions = machines.map(m => ({ value: m.id!, label: m.name }));

  return (
    <div className="flex flex-col space-y-5 pb-24 md:pb-28">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(ROUTES.PRODUCTION.LIST)}
          className="p-2 -ml-2 rounded-full hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <PageHeader 
          title={isEditing ? 'Edit Production' : 'New Production Entry'} 
          description="Log daily production details" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 max-w-5xl">
        
        <div className="lg:col-span-12 space-y-5">
          
          {/* 1. Setup Section */}
          <div className="bg-card border rounded-xl p-4 md:p-5 space-y-3 shadow-sm">
            <h2 className="text-base font-semibold">1. Setup</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="text-sm font-medium mb-1.5">Date</div>
                <input 
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="space-y-1.5">
                <div className="text-sm font-medium mb-1.5">Shift</div>
                <select 
                  value={shift}
                  onChange={(e) => setShift(e.target.value as ShiftType)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value={ShiftType.DAY}>Day Shift</option>
                  <option value={ShiftType.NIGHT}>Night Shift</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <div className="text-sm font-medium mb-1.5">Employee</div>
                <SearchableSelect
                  options={employeeOptions}
                  value={employeeId}
                  onChange={setEmployeeId}
                  placeholder="Select Employee..."
                />
              </div>
              <div className="space-y-1.5">
                <div className="text-sm font-medium mb-1.5">Machine</div>
                <SearchableSelect
                  options={machineOptions}
                  value={machineId}
                  onChange={setMachineId}
                  placeholder="Select Machine..."
                />
              </div>
            </div>
          </div>

          {/* 2. Production Sessions */}
          <div className="bg-card border rounded-xl p-4 md:p-5 space-y-3 shadow-sm">
            <h2 className="text-base font-semibold">2. Production Sessions</h2>
            
            <div className="space-y-3">
              {sessions.map((session, index) => (
                <div key={index} className="relative rounded-lg border bg-muted/20 p-4 space-y-3 shadow-sm group">
                  <h3 className="font-medium text-xs text-muted-foreground absolute top-3 left-3">
                    Session {index + 1}
                  </h3>
                  
                  {sessions.length > 1 && index > 0 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSession(index)}
                      className="absolute right-3 top-3 p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                      title="Remove Session"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <div className="space-y-1.5">
                      <div className="text-sm font-medium mb-1.5">Design Name</div>
                      <input 
                        type="text"
                        value={session.designName}
                        onChange={(e) => handleSessionChange(index, 'designName', e.target.value)}
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Enter design name..."
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <div className="text-sm font-medium mb-1.5">Total Stitches</div>
                      <input 
                        type="number"
                        inputMode="numeric"
                        min="0"
                        value={session.stitches === 0 ? '' : session.stitches}
                        onChange={(e) => handleSessionChange(index, 'stitches', Number(e.target.value))}
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring font-semibold"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {sessions.length < 2 && (
              <button
                type="button"
                onClick={handleAddSession}
                className="w-full flex items-center justify-center gap-2 h-10 border-2 border-dashed border-input rounded-lg text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <Plus className="h-4 w-4" /> Add Session
              </button>
            )}
          </div>

          {/* 3. Production */}
          <div className="bg-card border rounded-xl p-4 md:p-5 space-y-3 shadow-sm">
            <h2 className="text-base font-semibold">3. Production</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="text-sm font-medium mb-1.5">Production Quantity</div>
                <input 
                  type="number"
                  inputMode="numeric"
                  min="0"
                  value={productionQuantity === 0 ? '' : productionQuantity}
                  onChange={(e) => setProductionQuantity(Number(e.target.value))}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring text-green-600 dark:text-green-500 font-bold"
                  placeholder="0"
                />
              </div>
              <div className="space-y-1.5">
                <div className="text-sm font-medium mb-1.5">Hours Worked</div>
                <input 
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  min="0.5"
                  max="24"
                  value={hoursWorked}
                  onChange={(e) => setHoursWorked(e.target.value === '' ? '' : Number(e.target.value))}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring font-bold"
                  placeholder="0.0"
                />
              </div>
            </div>
          </div>

          {/* 4. Shift Metrics */}
          <div className="bg-card border rounded-xl p-4 md:p-5 space-y-3 shadow-sm">
            <h2 className="text-base font-semibold">4. Shift Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <div className="text-sm font-medium mb-1.5">Frames Changed</div>
                <input 
                  type="number"
                  inputMode="numeric"
                  min="0"
                  value={framesChanged === 0 ? '' : framesChanged}
                  onChange={(e) => setFramesChanged(Number(e.target.value))}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-1.5">
                <div className="text-sm font-medium mb-1.5">Thread Breakage</div>
                <input 
                  type="number"
                  inputMode="numeric"
                  min="0"
                  value={threadBreakage === 0 ? '' : threadBreakage}
                  onChange={(e) => setThreadBreakage(Number(e.target.value))}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-1.5">
                <div className="text-sm font-medium mb-1.5">Bonus Amount (₹)</div>
                <input 
                  type="number"
                  inputMode="numeric"
                  min="0"
                  value={bonus === 0 ? '' : bonus}
                  onChange={(e) => setBonus(Number(e.target.value))}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div className="space-y-1.5 pt-2">
              <div className="text-sm font-medium mb-1.5">Notes</div>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring min-h-[80px]"
                placeholder="Add any remarks regarding the shift..."
              />
            </div>
          </div>

        </div>

      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 md:left-[240px] z-40 bg-background/85 backdrop-blur-xl border-t p-4 pb-safe flex justify-end gap-3 shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
        <button
          onClick={() => navigate(ROUTES.PRODUCTION.LIST)}
          className="px-6 py-2.5 rounded-lg border border-input bg-background text-sm font-medium hover:bg-accent transition-colors hidden md:block"
        >
          Cancel
        </button>
        <button
          onClick={() => handleSave(ProductionStatus.DRAFT)}
          className="flex-1 md:flex-none px-6 py-2.5 rounded-lg border border-primary/20 bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
        >
          Save Draft
        </button>
        <button
          onClick={() => handleSave(ProductionStatus.PENDING)}
          className="flex-1 md:flex-none px-8 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-md"
        >
          Submit
        </button>
      </div>

    </div>
  );
}
