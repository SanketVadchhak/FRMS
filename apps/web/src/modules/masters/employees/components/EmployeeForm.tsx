import { useEffect } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { employeeSchema } from '@frms/shared';
import type { Employee, EmployeeFormValues } from '@frms/shared';

interface EmployeeFormProps {
  initialData?: Employee;
  onSubmit: (data: EmployeeFormValues) => void;
  isLoading?: boolean;
  onCancel?: () => void;
}

export function EmployeeForm({ initialData, onSubmit, isLoading, onCancel }: EmployeeFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema.omit({ id: true })) as unknown as Resolver<EmployeeFormValues>,
    defaultValues: {
      name: '',
      mobile: '',
      joiningDate: new Date().toISOString().split('T')[0],
      hourlyRate: 0,
      status: 'ACTIVE',
      notes: '',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        mobile: initialData.mobile,
        joiningDate: initialData.joiningDate,
        hourlyRate: initialData.hourlyRate,
        status: initialData.status,
        notes: initialData.notes || '',
        bankName: initialData.bankName || '',
        accountNumber: initialData.accountNumber || '',
        ifscCode: initialData.ifscCode || '',
      });
    }
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Personal Details */}
        <div className="space-y-4 md:col-span-2">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Personal Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Full Name</label>
              <input
                {...register('name')}
                id="name"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Enter full name"
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="mobile" className="text-sm font-medium">Mobile Number</label>
              <input
                {...register('mobile')}
                id="mobile"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="e.g. +919876543210"
              />
              {errors.mobile && <p className="text-xs text-destructive">{errors.mobile.message}</p>}
            </div>
          </div>
        </div>

        {/* Employment Details */}
        <div className="space-y-4 md:col-span-2">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider border-t pt-4">
            Employment Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="joiningDate" className="text-sm font-medium">Joining Date</label>
              <input
                {...register('joiningDate')}
                id="joiningDate"
                type="date"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              {errors.joiningDate && <p className="text-xs text-destructive">{errors.joiningDate.message}</p>}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="hourlyRate" className="text-sm font-medium">Hourly Rate (₹)</label>
              <input
                {...register('hourlyRate', { valueAsNumber: true })}
                id="hourlyRate"
                type="number"
                min="0"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              {errors.hourlyRate && <p className="text-xs text-destructive">{errors.hourlyRate.message}</p>}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">Status</label>
              <select
                {...register('status')}
                id="status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
              {errors.status && <p className="text-xs text-destructive">{errors.status.message}</p>}
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div className="space-y-4 md:col-span-2">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider border-t pt-4">
            Bank Details (Optional)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="bankName" className="text-sm font-medium">Bank Name</label>
              <input
                {...register('bankName')}
                id="bankName"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              {errors.bankName && <p className="text-xs text-destructive">{errors.bankName.message}</p>}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="accountNumber" className="text-sm font-medium">Account Number</label>
              <input
                {...register('accountNumber')}
                id="accountNumber"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              {errors.accountNumber && <p className="text-xs text-destructive">{errors.accountNumber.message}</p>}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="ifscCode" className="text-sm font-medium">IFSC Code</label>
              <input
                {...register('ifscCode')}
                id="ifscCode"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="e.g. SBIN0001234"
              />
              {errors.ifscCode && <p className="text-xs text-destructive">{errors.ifscCode.message}</p>}
            </div>
          </div>
        </div>

        {/* Additional Notes */}
        <div className="space-y-2 md:col-span-2">
          <label htmlFor="notes" className="text-sm font-medium">Notes</label>
          <textarea
            {...register('notes')}
            id="notes"
            rows={3}
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          {errors.notes && <p className="text-xs text-destructive">{errors.notes.message}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          {isLoading ? 'Saving...' : initialData ? 'Update Employee' : 'Create Employee'}
        </button>
      </div>
    </form>
  );
}
