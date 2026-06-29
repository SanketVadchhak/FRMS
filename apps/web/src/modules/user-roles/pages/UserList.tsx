import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUsers, useUpdateUser } from '../hooks/useUsers';
import { StatusBadge } from '@/components/feedback';
import { SectionCard, SkeletonTable, ErrorState } from '@/components';
import { formatDateTime } from '@/utils';
import { ROUTES } from '@/constants';
import { Plus, Edit2, CheckCircle, XCircle, X } from 'lucide-react';
import type { User, UserUpdateInput } from '@frms/shared';
import { UserStatus } from '@frms/shared';
import * as Dialog from '@radix-ui/react-dialog';
import { cn } from '@/utils/cn';
import { UserForm } from './UserForm';

export function UserList() {
  const { data: users, isLoading, isError, refetch } = useUsers();
  const updateUser = useUpdateUser();

  const [viewingUser, setViewingUser] = useState<User | undefined>();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleRowClick = (user: User) => {
    setViewingUser(user);
    setIsDetailsOpen(true);
    setIsEditing(false); // Make sure we show details first
  };

  const handleToggleStatus = () => {
    if (!viewingUser) return;
    const newStatus = viewingUser.status === UserStatus.ACTIVE ? UserStatus.INACTIVE : UserStatus.ACTIVE;
    const payload: UserUpdateInput = {
      username: viewingUser.username,
      role: viewingUser.role,
      status: newStatus,
    };
    
    updateUser.mutate(
      { id: viewingUser.id, data: payload },
      {
        onSuccess: () => {
          setViewingUser({ ...viewingUser, status: newStatus });
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Users</h3>
          <p className="text-sm text-muted-foreground">Manage system users and access</p>
        </div>
        <SectionCard>
          <SkeletonTable columns={4} rows={3} />
        </SectionCard>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Users</h3>
        </div>
        <ErrorState onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-medium">Users</h3>
          <p className="text-sm text-muted-foreground">
            Manage system users and access
          </p>
        </div>
        <Link 
          to={ROUTES.USERS.NEW} 
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Link>
      </div>
      
      <SectionCard className="p-0 overflow-hidden">
        <div className="w-full">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground border-b hidden sm:table-header-group">
              <tr>
                <th className="px-4 py-3 font-medium">Username</th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell">Role</th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell">Last Login</th>
                <th className="px-4 py-3 font-medium text-right sm:text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y block sm:table-row-group">
              {users?.length === 0 ? (
                <tr className="block sm:table-row">
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground block sm:table-cell">
                    No users found.
                  </td>
                </tr>
              ) : (
                users?.map((user) => (
                  <tr 
                    key={user.id} 
                    onClick={() => handleRowClick(user)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleRowClick(user);
                      }
                    }}
                    tabIndex={0}
                    className="hover:bg-muted/30 transition-colors cursor-pointer group flex flex-col sm:table-row py-3 sm:py-0 focus-visible:outline-none focus-visible:bg-muted/30"
                  >
                    {/* Mobile: Stacked, Desktop: Cell */}
                    <td className="px-4 sm:py-4 font-medium flex justify-between items-center sm:table-cell">
                      <div className="flex flex-col">
                        <span>{user.username}</span>
                        {/* Mobile Only: Role and Last Login */}
                        <span className="text-xs font-normal text-muted-foreground sm:hidden mt-0.5">
                          {user.role} &bull; Last login {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : 'Never'}
                        </span>
                      </div>
                      
                      {/* Mobile Only: Status Badge */}
                      <div className="sm:hidden">
                        <StatusBadge status={user.status} />
                      </div>
                    </td>
                    
                    {/* Desktop Only: Role */}
                    <td className="hidden lg:table-cell px-4 py-4 text-muted-foreground">
                      {user.role}
                    </td>

                    {/* Desktop Only: Last Login */}
                    <td className="hidden lg:table-cell px-4 py-4 text-muted-foreground">
                      {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : 'Never'}
                    </td>
                    
                    {/* Desktop Only: Status */}
                    <td className="hidden sm:table-cell px-4 py-4">
                      <StatusBadge status={user.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Details Slide-over */}
      <Dialog.Root open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm animate-in fade-in" />
          <Dialog.Content className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-md bg-background border-l shadow-2xl duration-300 animate-in slide-in-from-right overflow-y-auto flex flex-col">
            {viewingUser && (
              <>
                <div className="flex items-center justify-between p-6 border-b">
                  <Dialog.Title className="text-xl font-bold">
                    {isEditing ? 'Edit User' : 'User Details'}
                  </Dialog.Title>
                  <Dialog.Close asChild>
                    <button className="p-2 hover:bg-muted rounded-full outline-none">
                      <X className="h-5 w-5" />
                    </button>
                  </Dialog.Close>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  {isEditing ? (
                    <div className="p-6">
                      <UserForm 
                        id={viewingUser.id} 
                        onSuccess={() => {
                          setIsEditing(false);
                          refetch(); // Refetch the list just in case
                        }}
                        onCancel={() => setIsEditing(false)}
                      />
                    </div>
                  ) : (
                    <div className="p-6 space-y-8">
                      {/* Status Header */}
                      <div className="flex items-center justify-between">
                        <StatusBadge status={viewingUser.status} />
                      </div>
                      
                      {/* Account Info */}
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                          Account
                        </h4>
                        <dl className="grid grid-cols-2 gap-4">
                          <div>
                            <dt className="text-sm text-muted-foreground">Username</dt>
                            <dd className="text-sm font-medium mt-1">{viewingUser.username}</dd>
                          </div>
                          <div>
                            <dt className="text-sm text-muted-foreground">Role</dt>
                            <dd className="text-sm font-medium mt-1">{viewingUser.role}</dd>
                          </div>
                        </dl>
                      </div>

                      {/* Activity */}
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                          Activity
                        </h4>
                        <dl className="grid grid-cols-2 gap-4">
                          <div className="col-span-2">
                            <dt className="text-sm text-muted-foreground">Last Login</dt>
                            <dd className="text-sm font-medium mt-1">
                              {viewingUser.lastLoginAt ? formatDateTime(viewingUser.lastLoginAt) : 'Never'}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm text-muted-foreground">Created Date</dt>
                            <dd className="text-sm font-medium mt-1">{formatDateTime(viewingUser.createdAt)}</dd>
                          </div>
                          <div>
                            <dt className="text-sm text-muted-foreground">Updated Date</dt>
                            <dd className="text-sm font-medium mt-1">{formatDateTime(viewingUser.updatedAt)}</dd>
                          </div>
                        </dl>
                      </div>

                      {/* Permissions */}
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                          Permissions
                        </h4>
                        <div className="bg-muted/50 p-4 rounded-lg border shadow-sm">
                          <p className="text-sm text-muted-foreground mb-3">
                            Permissions are inherited from the <strong className="text-foreground">{viewingUser.role}</strong> role.
                          </p>
                          <Link 
                            to={ROUTES.USERS.ROLES}
                            className="text-sm text-primary hover:underline font-medium inline-flex items-center"
                            onClick={() => setIsDetailsOpen(false)}
                          >
                            View Role Matrix <span className="ml-1">&rarr;</span>
                          </Link>
                        </div>
                      </div>

                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                {!isEditing && (
                  <div className="p-6 border-t bg-muted/20 space-y-3 shrink-0">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4"
                    >
                      <Edit2 className="mr-2 h-4 w-4" /> Edit User
                    </button>
                    <button
                      onClick={handleToggleStatus}
                      className={cn(
                        "w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none border h-10 px-4",
                        viewingUser.status === UserStatus.ACTIVE 
                          ? "border-destructive/20 text-destructive hover:bg-destructive/10" 
                          : "border-green-600/20 text-green-700 hover:bg-green-600/10"
                      )}
                    >
                      {viewingUser.status === UserStatus.ACTIVE ? (
                        <><XCircle className="mr-2 h-4 w-4" /> Deactivate User</>
                      ) : (
                        <><CheckCircle className="mr-2 h-4 w-4" /> Activate User</>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
