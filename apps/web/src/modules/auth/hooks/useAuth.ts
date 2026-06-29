import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import type { LoginInput, ChangePasswordInput } from '../schemas/auth.schema';
import { authService } from '../services/auth.service';

export function useLogin() {
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (credentials: LoginInput) => login(credentials),
    onSuccess: (_, variables) => {
      // Small delay for UX so it feels "real" but fast
      toast.success(`Welcome back, ${variables.username}`);
      // Find where we wanted to go, or go to dashboard
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const state = (window.history.state as any)?.usr?.from;
      const redirectTo = state?.pathname || '/';
      navigate(redirectTo, { replace: true });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to login');
    }
  });
}

export function useLogout() {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      toast.success('Logged out successfully');
      navigate('/login', { replace: true });
    },
    onError: () => {
      toast.error('Failed to logout');
    }
  });
}

export function useChangePassword() {
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: (data: ChangePasswordInput) => {
      if (!user) throw new Error('Not authenticated');
      return authService.changePassword(user.username, data);
    },
    onSuccess: () => {
      toast.success('Password changed successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to change password');
    }
  });
}
