import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@frms/shared';
import { authService } from '../services/auth.service';
import type { LoginInput } from '../schemas/auth.schema';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  expiresAt: string | null;
  rememberMe: boolean;
  loading: boolean;
  initialized: boolean;

  login: (credentials: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  isExpired: () => boolean;
}

const HOURS_8_MS = 8 * 60 * 60 * 1000;
const DAYS_30_MS = 30 * 24 * 60 * 60 * 1000;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      expiresAt: null,
      rememberMe: false,
      loading: false,
      initialized: false,

      isExpired: () => {
        const { expiresAt } = get();
        if (!expiresAt) return true;
        return new Date().getTime() > new Date(expiresAt).getTime();
      },

      login: async (credentials: LoginInput) => {
        set({ loading: true });
        try {
          const { user, accessToken } = await authService.login(credentials);
          
          const duration = credentials.rememberMe ? DAYS_30_MS : HOURS_8_MS;
          const expiresAt = new Date(Date.now() + duration).toISOString();

          set({
            user,
            accessToken,
            expiresAt,
            rememberMe: credentials.rememberMe,
            initialized: true,
          });
        } finally {
          set({ loading: false });
        }
      },

      logout: async () => {
        const { user } = get();
        set({ loading: true });
        try {
          if (user) {
            await authService.logout(user.username);
          }
        } finally {
          set({
            user: null,
            accessToken: null,
            expiresAt: null,
            rememberMe: false,
            loading: false,
            initialized: true,
          });
        }
      },

      restoreSession: async () => {
        const { isExpired, user, logout } = get();
        
        // Prevent unnecessary restores if already checked
        set({ loading: true });
        
        try {
          if (!user) {
            set({ initialized: true });
            return;
          }

          if (isExpired()) {
            await authService.logSessionExpired(user.username);
            await logout();
            return;
          }

          // Valid session
          await authService.updateActivity(user.username);
          set({ initialized: true });
        } catch {
          await logout();
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: 'frms-auth-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        expiresAt: state.expiresAt,
        rememberMe: state.rememberMe,
        // specifically DO NOT persist loading and initialized
      }),
    }
  )
);

// Identity Helpers to prevent direct zustand access in services
export const getCurrentUser = (): User | null => useAuthStore.getState().user;
export const getCurrentUsername = (): string => useAuthStore.getState().user?.username || 'system';
export const getCurrentRole = (): string | null => useAuthStore.getState().user?.role || null;
export const getIsAuthenticated = (): boolean => !!useAuthStore.getState().user && !useAuthStore.getState().isExpired();
