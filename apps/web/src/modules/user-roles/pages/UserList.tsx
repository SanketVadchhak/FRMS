import { Link } from 'react-router-dom';
import { useUsers } from '../hooks/useUsers';
import { UserStatusBadge } from '../components/UserStatusBadge';
import { PageHeader, SectionCard, SkeletonTable, ErrorState } from '@/components';
import { formatDateTime } from '@/utils';
import { ROUTES } from '@/constants';
import { Plus, Edit2 } from 'lucide-react';

export function UserList() {
  const { data: users, isLoading, isError, refetch } = useUsers();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="User Management" description="Manage system users and roles" />
        <SectionCard>
          <SkeletonTable columns={5} rows={3} />
        </SectionCard>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="User Management" />
        <ErrorState onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="User Management" 
        description="Manage system users and roles"
        action={
          <Link 
            to={ROUTES.USERS.NEW} 
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Link>
        }
      />
      
      <SectionCard>
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Username</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Role</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Last Login</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {users?.map((user) => (
                <tr key={user.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <td className="p-4 align-middle font-medium">{user.username}</td>
                  <td className="p-4 align-middle">{user.role}</td>
                  <td className="p-4 align-middle">
                    <UserStatusBadge status={user.status} />
                  </td>
                  <td className="p-4 align-middle text-muted-foreground">
                    {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : 'Never'}
                  </td>
                  <td className="p-4 align-middle text-right">
                    <Link
                      to={ROUTES.USERS.EDIT.replace(':id', user.id)}
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground h-8 w-8"
                    >
                      <Edit2 className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Link>
                  </td>
                </tr>
              ))}
              {users?.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-muted-foreground h-24">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
