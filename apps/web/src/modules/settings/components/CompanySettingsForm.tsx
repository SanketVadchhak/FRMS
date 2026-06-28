import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { SectionCard, LoadingSpinner, SkeletonCard, ErrorState } from '@/components';
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@/constants';
import { companySettingsSchema, type CompanySettings } from '@frms/shared';
import { useCompanySettings, useUpdateCompanySettings } from '../hooks/useSettings';

export function CompanySettingsForm() {
  const { can } = usePermissions();
  const hasWriteAccess = can(PERMISSIONS.SETTINGS_WRITE);

  const { data: settings, isLoading, isError, refetch } = useCompanySettings();
  const updateSettings = useUpdateCompanySettings();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<CompanySettings>({
    resolver: zodResolver(companySettingsSchema) as unknown as Resolver<CompanySettings>,
    defaultValues: {
      name: '',
      address: '',
      phone: '',
      email: '',
      gstNumber: '',
    },
  });

  useEffect(() => {
    if (settings) {
      reset(settings);
    }
  }, [settings, reset]);

  const onSubmit = async (data: CompanySettings) => {
    try {
      await updateSettings.mutateAsync(data);
      reset(data); // Reset form state so isDirty becomes false
      toast.success('Company settings saved successfully');
    } catch (error) {
      console.error('Failed to save company settings', error);
      toast.error('Failed to save settings. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <SkeletonCard className="h-64" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6 max-w-2xl">
        <ErrorState 
          title="Failed to load settings" 
          message="We couldn't retrieve the company settings. Please try again."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-lg font-medium">Company Profile</h3>
        <p className="text-sm text-muted-foreground">
          This information will be displayed on reports and payroll slips.
        </p>
      </div>

      <SectionCard>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium leading-none">
                Company Name
              </label>
              <input
                id="name"
                {...register('name')}
                disabled={!hasWriteAccess || isSubmitting}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              {errors.name && <p className="text-[0.8rem] text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="address" className="text-sm font-medium leading-none">
                Address
              </label>
              <textarea
                id="address"
                {...register('address')}
                disabled={!hasWriteAccess || isSubmitting}
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              {errors.address && <p className="text-[0.8rem] text-destructive">{errors.address.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium leading-none">
                  Phone Number
                </label>
                <input
                  id="phone"
                  {...register('phone')}
                  disabled={!hasWriteAccess || isSubmitting}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                {errors.phone && <p className="text-[0.8rem] text-destructive">{errors.phone.message}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium leading-none">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  disabled={!hasWriteAccess || isSubmitting}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                {errors.email && <p className="text-[0.8rem] text-destructive">{errors.email.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="gstNumber" className="text-sm font-medium leading-none">
                GST Number (Optional)
              </label>
              <input
                id="gstNumber"
                {...register('gstNumber')}
                disabled={!hasWriteAccess || isSubmitting}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              {errors.gstNumber && <p className="text-[0.8rem] text-destructive">{errors.gstNumber.message}</p>}
            </div>
          </div>

          {hasWriteAccess && (
            <div className="flex justify-end border-t pt-6 mt-6">
              <button
                type="submit"
                disabled={!isDirty || isSubmitting}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                {isSubmitting ? (
                  <><LoadingSpinner size="sm" className="mr-2 text-primary-foreground" /> Saving...</>
                ) : (
                  'Save Settings'
                )}
              </button>
            </div>
          )}
        </form>
      </SectionCard>
    </div>
  );
}
