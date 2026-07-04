import { useEffect } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { machineSchema, MachineStatus } from '@frms/shared';
import type { Machine, MachineCreateInput } from '@frms/shared';

interface MachineFormProps {
  initialData?: Machine;
  onSubmit: (data: MachineCreateInput) => void;
  isLoading?: boolean;
  onCancel?: () => void;
}

export function MachineForm({ initialData, onSubmit, isLoading, onCancel }: MachineFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MachineCreateInput>({
    resolver: zodResolver(machineSchema.omit({ id: true })) as unknown as Resolver<MachineCreateInput>,
    defaultValues: {
      name: '',
      status: MachineStatus.ACTIVE,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        status: initialData.status,
      });
    } else {
      reset({
        name: '',
        status: MachineStatus.ACTIVE,
      });
    }
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Machine Name <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          {...register('name')}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
          placeholder="e.g. Loom #104, Knitting Unit A"
        />
        {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Status <span className="text-destructive">*</span>
        </label>
        <select
          {...register('status')}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
        >
          <option value={MachineStatus.ACTIVE}>Active</option>
          <option value={MachineStatus.INACTIVE}>Inactive</option>
          <option value={MachineStatus.MAINTENANCE}>Maintenance</option>
        </select>
        {errors.status && <p className="mt-1 text-xs text-destructive">{errors.status.message}</p>}
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : initialData ? 'Update Machine' : 'Create Machine'}
        </button>
      </div>
    </form>
  );
}
