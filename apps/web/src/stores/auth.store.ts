import { create } from 'zustand';
import type { User } from '@frms/shared';
import { UserRole, UserStatus } from '@frms/shared';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string) => void;
  clearAuth: () => void;
}

// Temporary mock user for development until login is implemented
const MOCK_ADMIN: User = {
  id: '1',
  username: 'admin',
  role: UserRole.ADMIN,
  status: UserStatus.ACTIVE,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const useAuthStore = create<AuthState>((set) => ({
  user: MOCK_ADMIN, // Mocked for module development
  accessToken: 'mock-token',
  isAuthenticated: true,
  setAuth: (user, accessToken) => set({ user, accessToken, isAuthenticated: true }),
  clearAuth: () => set({ user: null, accessToken: null, isAuthenticated: false }),
}));
