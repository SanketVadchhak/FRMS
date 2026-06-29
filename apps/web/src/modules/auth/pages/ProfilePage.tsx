import { useState } from 'react';
import { UserCircle2, Key, Calendar, Shield, Clock } from 'lucide-react';
import { useAuthStore } from '../store/auth.store';
import { PageHeader, SectionCard, StatusBadge } from '@/components';
import { ChangePasswordDialog } from '../components/ChangePasswordDialog';

export function ProfilePage() {
  const { user, expiresAt } = useAuthStore();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="My Profile"
        description="View your personal information and session details"
        action={
          <button
            onClick={() => setIsPasswordDialogOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
          >
            <Key className="h-4 w-4" />
            Change Password
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <SectionCard className="text-center p-6 h-full flex flex-col items-center justify-center">
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
              <UserCircle2 className="h-12 w-12" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">{user.username}</h2>
            <div className="mt-2 flex items-center justify-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground uppercase tracking-widest">{user.role}</span>
            </div>
            <div className="mt-4">
              <StatusBadge status={user.status as "ACTIVE" | "INACTIVE"} />
            </div>
          </SectionCard>
        </div>

        <div className="md:col-span-2">
          <SectionCard title="Account Details" className="h-full">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <UserCircle2 className="h-4 w-4" /> Username
                  </span>
                  <p className="text-base font-medium">{user.username}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Shield className="h-4 w-4" /> Role
                  </span>
                  <p className="text-base font-medium capitalize">{user.role}</p>
                </div>
              </div>

              <div className="h-px bg-border" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Member Since
                  </span>
                  <p className="text-base font-medium">
                    {new Date(user.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Last Login
                  </span>
                  <p className="text-base font-medium">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('en-IN') : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="h-px bg-border" />
              
              <div className="space-y-1">
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Session Expires
                </span>
                <p className="text-base font-medium">
                  {expiresAt ? new Date(expiresAt).toLocaleString('en-IN') : 'Session active'}
                </p>
              </div>

            </div>
          </SectionCard>
        </div>
      </div>

      <ChangePasswordDialog 
        open={isPasswordDialogOpen} 
        onOpenChange={setIsPasswordDialogOpen} 
      />
    </div>
  );
}
