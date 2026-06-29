import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Key } from 'lucide-react';
import { changePasswordSchema } from '../schemas/auth.schema';
import type { ChangePasswordInput } from '../schemas/auth.schema';
import { useChangePassword } from '../hooks/useAuth';
import { Input } from '@/components';

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
  const changePasswordMutation = useChangePassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data: ChangePasswordInput) => {
    changePasswordMutation.mutate(data, {
      onSuccess: () => {
        reset();
        onOpenChange(false);
      },
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) reset();
    onOpenChange(newOpen);
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] border bg-card p-6 shadow-lg sm:rounded-xl">
          <div className="flex items-center justify-between mb-5">
            <Dialog.Title className="text-lg font-semibold flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              Change Password
            </Dialog.Title>
            <Dialog.Close className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              {...register('currentPassword')}
              error={errors.currentPassword?.message}
              disabled={changePasswordMutation.isPending}
            />

            <div className="h-px bg-border my-2" />

            <Input
              label="New Password"
              type="password"
              {...register('newPassword')}
              error={errors.newPassword?.message}
              disabled={changePasswordMutation.isPending}
            />

            <Input
              label="Confirm New Password"
              type="password"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
              disabled={changePasswordMutation.isPending}
            />

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => handleOpenChange(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={changePasswordMutation.isPending}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={changePasswordMutation.isPending}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 transition-colors"
              >
                {changePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
