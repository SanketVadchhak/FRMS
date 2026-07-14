import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '@/components';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import {
  useProductionEntries,
  useCreateProductionEntry,
  useUpdateProductionEntry,
} from '../hooks/useProduction';
import { useEmployees } from '@/modules/masters/employees/hooks/useEmployees';
import { useMachines } from '@/modules/masters/machines/hooks/useMachines';
import type { ProductionEntry as IProductionEntry } from '@frms/shared';
import { ShiftType, ProductionStatus } from '@frms/shared';
import { ROUTES } from '@/constants';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';

// ─── Form Schema ──────────────────────────────────────────────────────────────
const productionEntryFormSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  employeeId: z.string().min(1, 'Employee is required'),
  machineId: z.string().min(1, 'Machine is required'),
  shift: z.nativeEnum(ShiftType),
  details: z
    .array(
      z.object({
        designName: z.string().optional(),
        totalStitches: z.coerce.number().min(0, 'Must be 0 or more').optional(),
      }),
    )
    .min(1, 'At least one production session is required'),
  productionQuantity: z.coerce.number().min(0, 'Must be 0 or more'),
  hoursWorked: z.coerce
    .number({ invalid_type_error: 'Hours worked is required' })
    .min(0.5, 'Minimum 0.5 hours')
    .max(24, 'Maximum 24 hours'),
  framesChanged: z.coerce.number().min(0),
  threadBreakage: z.coerce.number().min(0),
  bonus: z.coerce.number().min(0),
  upadAmount: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
});

type ProductionEntryFormValues = z.infer<typeof productionEntryFormSchema>;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const inputClass =
  'h-10 w-full rounded-md border border-input bg-background px-3 text-sm ' +
  'focus:outline-none focus:ring-2 focus:ring-ring transition-colors ' +
  'placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50';

const labelClass = 'block text-sm font-medium mb-1.5';
const errorClass = 'mt-1 text-xs text-destructive';

// ─── Component ────────────────────────────────────────────────────────────────
export function ProductionEntry() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const { data: entries } = useProductionEntries();
  const { data: rawEmployees } = useEmployees();
  const { data: rawMachines } = useMachines();

  const employees = rawEmployees || [];
  const machines = rawMachines || [];

  const createMutation = useCreateProductionEntry();
  const updateMutation = useUpdateProductionEntry();

  // Track which status to submit with (Draft vs Submit)
  const [submitStatus, setSubmitStatus] = useState<ProductionStatus>(ProductionStatus.DRAFT);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ProductionEntryFormValues>({
    resolver: zodResolver(productionEntryFormSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      employeeId: '',
      machineId: '',
      shift: ShiftType.DAY,
      details: (() => {
        try {
          const saved = localStorage.getItem('frms_last_production_details');
          if (saved) return JSON.parse(saved);
        } catch {
          // ignore
        }
        return [{ designName: '', totalStitches: '' as unknown as number }];
      })(),
      productionQuantity: '' as unknown as number,
      hoursWorked: 12,
      framesChanged: '' as unknown as number,
      threadBreakage: '' as unknown as number,
      bonus: '' as unknown as number,
      upadAmount: '' as unknown as number,
      notes: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'details',
  });

  // Populate form when editing an existing entry
  useEffect(() => {
    if (isEditing && entries) {
      const entry = entries.find((e) => e.id === id);
      if (entry) {
        reset({
          date: entry.date,
          employeeId: entry.employeeId,
          machineId: entry.machineId,
          shift: entry.shift,
          details: entry.details.map((d) => ({
            designName: d.designName,
            totalStitches: d.totalStitches,
          })),
          productionQuantity: entry.productionQuantity,
          hoursWorked: entry.hoursWorked,
          framesChanged: entry.framesChanged ?? 0,
          threadBreakage: entry.threadBreakage ?? 0,
          bonus: entry.bonus ?? 0,
          upadAmount: entry.upadAmount ?? ('' as unknown as number),
          notes: entry.notes ?? '',
        });
      }
    }
  }, [isEditing, id, entries, reset]);

  // Auto-select last used machine for the selected employee
  const selectedEmployeeId = useWatch({ control, name: 'employeeId' });
  
  useEffect(() => {
    if (!isEditing && selectedEmployeeId && entries && entries.length > 0) {
      // Entries are already sorted by date desc from backend
      const lastEntry = entries.find((e) => e.employeeId === selectedEmployeeId);
      if (lastEntry && lastEntry.machineId) {
        setValue('machineId', lastEntry.machineId, { 
          shouldDirty: true,
          shouldValidate: true 
        });
      }
    }
  }, [selectedEmployeeId, isEditing, entries, setValue]);

  const handleCancel = () => {
    if (isDirty && !window.confirm('You have unsaved changes. Leave anyway?')) return;
    navigate(ROUTES.PRODUCTION.LIST);
  };

  const submitWithStatus = (status: ProductionStatus) => (data: ProductionEntryFormValues) => {
    const payload: Omit<IProductionEntry, 'id' | 'createdAt' | 'updatedAt'> = {
      date: data.date,
      employeeId: data.employeeId,
      machineId: data.machineId,
      shift: data.shift,
      details: data.details.map((d) => ({
        designName: d.designName,
        totalStitches: d.totalStitches,
      })),
      productionQuantity: data.productionQuantity,
      hoursWorked: data.hoursWorked,
      framesChanged: data.framesChanged,
      threadBreakage: data.threadBreakage,
      bonus: data.bonus,
      upadAmount: data.upadAmount,
      notes: data.notes ?? '',
      status,
      rejectionReason: undefined,
    };

    localStorage.setItem('frms_last_production_details', JSON.stringify(payload.details));

    if (isEditing) {
      updateMutation.mutate(
        { id: id!, updates: payload },
        { onSuccess: () => navigate(ROUTES.PRODUCTION.LIST) },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => navigate(ROUTES.PRODUCTION.LIST),
      });
    }
  };

  const handleSave = (status: ProductionStatus) => {
    setSubmitStatus(status);
    handleSubmit(submitWithStatus(status))();
  };

  const employeeOptions = employees.map((e) => ({ value: e.id!, label: e.name }));
  const machineOptions = machines.map((m) => ({ value: m.id!, label: m.name }));

  const isBusy = isSubmitting || createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex flex-col space-y-5 pb-28">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleCancel}
          className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <PageHeader
          title={isEditing ? 'Edit Production Entry' : 'New Production Entry'}
          description="Log daily production details"
        />
      </div>

      <div className="max-w-3xl space-y-5">
        {/* ── 1. Setup ── */}
        <section className="bg-card border rounded-xl p-4 md:p-5 space-y-4 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            1 · Setup
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label htmlFor="date" className={labelClass}>Date</label>
              <input
                id="date"
                type="date"
                {...register('date')}
                className={inputClass}
              />
              {errors.date && <p className={errorClass}>{errors.date.message}</p>}
            </div>

            {/* Shift */}
            <div>
              <label htmlFor="shift" className={labelClass}>Shift</label>
              <select id="shift" {...register('shift')} className={inputClass}>
                <option value={ShiftType.DAY}>Day Shift</option>
                <option value={ShiftType.NIGHT}>Night Shift</option>
              </select>
              {errors.shift && <p className={errorClass}>{errors.shift.message}</p>}
            </div>

            {/* Employee */}
            <div>
              <div className={labelClass}>Employee</div>
              <Controller
                control={control}
                name="employeeId"
                render={({ field }) => (
                  <SearchableSelect
                    options={employeeOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select employee..."
                  />
                )}
              />
              {errors.employeeId && <p className={errorClass}>{errors.employeeId.message}</p>}
            </div>

            {/* Machine */}
            <div>
              <div className={labelClass}>Machine</div>
              <Controller
                control={control}
                name="machineId"
                render={({ field }) => (
                  <SearchableSelect
                    options={machineOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select machine..."
                  />
                )}
              />
              {errors.machineId && <p className={errorClass}>{errors.machineId.message}</p>}
            </div>
          </div>
        </section>

        {/* ── 2. Production Sessions ── */}
        <section className="bg-card border rounded-xl p-4 md:p-5 space-y-3 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            2 · Production Sessions
          </h2>

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="relative rounded-lg border bg-muted/20 p-4 pt-8 space-y-3"
              >
                <span className="absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Session {index + 1}
                </span>

                {fields.length > 1 && index > 0 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="absolute right-3 top-3 p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                    aria-label="Remove session"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor={`details.${index}.designName`} className={labelClass}>
                      Design Name
                    </label>
                    <input
                      id={`details.${index}.designName`}
                      type="text"
                      {...register(`details.${index}.designName`)}
                      className={inputClass}
                      placeholder="e.g. ABC Floral Logo"
                    />
                    {errors.details?.[index]?.designName && (
                      <p className={errorClass}>{errors.details[index]?.designName?.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor={`details.${index}.totalStitches`} className={labelClass}>
                      Total Stitches
                    </label>
                    <input
                      id={`details.${index}.totalStitches`}
                      type="number"
                      inputMode="numeric"
                      min={0}
                      {...register(`details.${index}.totalStitches`)}
                      className={inputClass}
                      placeholder="0"
                    />
                    {errors.details?.[index]?.totalStitches && (
                      <p className={errorClass}>{errors.details[index]?.totalStitches?.message}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {errors.details?.root && (
            <p className={errorClass}>{errors.details.root.message}</p>
          )}

          {fields.length < 5 && (
            <button
              type="button"
              onClick={() => append({ designName: '', totalStitches: '' as unknown as number })}
              className="w-full flex items-center justify-center gap-2 h-10 border-2 border-dashed border-input rounded-lg text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Session
            </button>
          )}
        </section>

        {/* ── 3. Production ── */}
        <section className="bg-card border rounded-xl p-4 md:p-5 space-y-4 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            3 · Production
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="productionQuantity" className={labelClass}>
                Production Quantity
              </label>
              <input
                id="productionQuantity"
                type="number"
                inputMode="numeric"
                min={0}
                {...register('productionQuantity')}
                className={`${inputClass} font-semibold text-emerald-600 dark:text-emerald-500`}
                placeholder="0"
              />
              {errors.productionQuantity && (
                <p className={errorClass}>{errors.productionQuantity.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="hoursWorked" className={labelClass}>
                Hours Worked
              </label>
              <input
                id="hoursWorked"
                type="number"
                inputMode="decimal"
                step={0.5}
                min={0.5}
                max={24}
                {...register('hoursWorked')}
                className={`${inputClass} font-semibold`}
                placeholder="e.g. 8"
              />
              {errors.hoursWorked && (
                <p className={errorClass}>{errors.hoursWorked.message}</p>
              )}
            </div>
          </div>
        </section>

        {/* ── 4. Shift Metrics ── */}
        <section className="bg-card border rounded-xl p-4 md:p-5 space-y-4 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            4 · Shift Metrics
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="framesChanged" className={labelClass}>Frames Changed</label>
              <input
                id="framesChanged"
                type="number"
                inputMode="numeric"
                min={0}
                {...register('framesChanged')}
                className={inputClass}
                placeholder="0"
              />
            </div>
            <div>
              <label htmlFor="threadBreakage" className={labelClass}>Thread Breakage</label>
              <input
                id="threadBreakage"
                type="number"
                inputMode="numeric"
                min={0}
                {...register('threadBreakage')}
                className={inputClass}
                placeholder="0"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="bonus" className={labelClass}>Bonus (₹)</label>
              <input
                id="bonus"
                type="number"
                inputMode="numeric"
                min={0}
                {...register('bonus')}
                className={inputClass}
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label htmlFor="notes" className={labelClass}>Notes</label>
            <textarea
              id="notes"
              {...register('notes')}
              className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors min-h-[80px] resize-none placeholder:text-muted-foreground"
              placeholder="Add any shift remarks…"
            />
          </div>
        </section>

        {/* ── 5. Upad (Daily Advance) ── */}
        <section className="bg-card border rounded-xl p-4 md:p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              5 · Upad / Daily Advance
            </h2>
            <span className="text-xs text-muted-foreground font-medium px-2 py-0.5 rounded-full bg-muted border">Optional</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="upadAmount" className={labelClass}>Amount (₹)</label>
              <input
                id="upadAmount"
                type="number"
                inputMode="numeric"
                min={0}
                {...register('upadAmount')}
                className={`${inputClass} font-semibold text-primary`}
                placeholder="e.g. 200"
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                This will automatically record a daily advance payment for the employee.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* ── Sticky Action Bar ── */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 md:left-20 lg:left-64 z-40 bg-background/90 backdrop-blur-xl border-t p-4 flex justify-end gap-3 shadow-[0_-4px_24px_rgba(0,0,0,0.04)]">
        <button
          type="button"
          onClick={handleCancel}
          disabled={isBusy}
          className="hidden md:block px-5 py-2.5 rounded-lg border border-input bg-background text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50"
        >
          Cancel
        </button>

        {isEditing && entries?.find(e => e.id === id)?.status === ProductionStatus.APPROVED ? (
          <button
            type="button"
            onClick={() => handleSave(ProductionStatus.APPROVED)}
            disabled={isBusy}
            className="flex-1 md:flex-none px-7 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
          >
            {isBusy && submitStatus === ProductionStatus.APPROVED ? 'Saving…' : 'Update Approved Record'}
          </button>
        ) : isEditing && entries?.find(e => e.id === id)?.status === ProductionStatus.REJECTED ? (
          <button
            type="button"
            onClick={() => handleSave(ProductionStatus.PENDING)}
            disabled={isBusy}
            className="flex-1 md:flex-none px-7 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
          >
            {isBusy && submitStatus === ProductionStatus.PENDING ? 'Resubmitting…' : 'Fix & Resubmit'}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => handleSave(ProductionStatus.DRAFT)}
              disabled={isBusy}
              className="flex-1 md:flex-none px-5 py-2.5 rounded-lg border border-primary/20 bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors disabled:opacity-50"
            >
              {isBusy && submitStatus === ProductionStatus.DRAFT ? 'Saving…' : 'Save Draft'}
            </button>
            <button
              type="button"
              onClick={() => handleSave(ProductionStatus.PENDING)}
              disabled={isBusy}
              className="flex-1 md:flex-none px-7 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
            >
              {isBusy && submitStatus === ProductionStatus.PENDING ? 'Submitting…' : 'Submit'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
