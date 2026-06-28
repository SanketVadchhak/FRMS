import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import type { SubmitHandler, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserRole, UserStatus, userCreateSchema, userUpdateSchema } from '@frms/shared';
import type { UserCreateInput, UserUpdateInput } from '@frms/shared';
import { useUser, useCreateUser, useUpdateUser } from '../hooks/useUsers';
import { PageHeader, SectionCard, LoadingSpinner } from '@/components';
import { ROUTES } from '@/constants';

export function UserForm() {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();

  const { data: user, isLoading: isFetching } = useUser(id);
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  type FormData = {
    username: string;
    password?: string;
    role: UserRole;
    status: UserStatus;
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: (isEditing ? zodResolver(userUpdateSchema) : zodResolver(userCreateSchema)) as unknown as Resolver<FormData>,
    defaultValues: {
      username: '',
      password: '',
      role: UserRole.OPERATOR,
      status: UserStatus.ACTIVE,
    }
  });

  useEffect(() => {
    if (user && isEditing) {
      reset({
        username: user.username,
        role: user.role,
        status: user.status,
        password: '',
      });
    }
  }, [user, isEditing, reset]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      if (isEditing) {
        await updateUser.mutateAsync({ id: id!, data: data as UserUpdateInput });
      } else {
        await createUser.mutateAsync(data as UserCreateInput);
      }
      navigate(ROUTES.USERS.LIST);
    } catch (error) {
      console.error("Failed to save user", error);
      alert((error as Error).message || "An error occurred while saving.");
    }
  };

  if (isEditing && isFetching) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <PageHeader 
        title={isEditing ? 'Edit User' : 'Add New User'} 
        description={isEditing ? 'Modify user details and roles' : 'Create a new system user'}
      />

      <SectionCard>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Username
            </label>
            <input 
              id="username"
              {...register('username')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="e.g. jdoe"
            />
            {errors.username && <p className="text-[0.8rem] font-medium text-destructive">{errors.username.message}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Password {isEditing && <span className="text-muted-foreground font-normal">(Leave blank to keep unchanged)</span>}
            </label>
            <input 
              id="password"
              type="password"
              {...register('password')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="********"
            />
            {errors.password && <p className="text-[0.8rem] font-medium text-destructive">{errors.password.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Role
              </label>
              <select 
                id="role"
                {...register('role')}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {Object.values(UserRole).map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              {errors.role && <p className="text-[0.8rem] font-medium text-destructive">{errors.role.message}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Status
              </label>
              <select 
                id="status"
                {...register('status')}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {Object.values(UserStatus).map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              {errors.status && <p className="text-[0.8rem] font-medium text-destructive">{errors.status.message}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-4 border-t pt-6 mt-6">
            <button
              type="button"
              onClick={() => navigate(ROUTES.USERS.LIST)}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              {isSubmitting ? (
                <><LoadingSpinner size="sm" className="mr-2 text-primary-foreground" /> Saving...</>
              ) : (
                'Save User'
              )}
            </button>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
