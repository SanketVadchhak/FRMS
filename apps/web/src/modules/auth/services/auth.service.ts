import { apiClient } from '@/lib/apiClient';
import type { LoginInput } from '../schemas/auth.schema';
import type { User } from '@frms/shared';

// Fastify returns { user, token } on login
interface LoginResponse {
  user: User;
  token: string;
}

export const authService = {
  login: async (credentials: LoginInput): Promise<{ user: User; accessToken: string }> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    return {
      user: response.user,
      accessToken: response.token,
    };
  },

  logout: async (_username?: string): Promise<void> => {
    await apiClient.post('/auth/logout', {});
  },

  changePassword: async (_username: string, data: any): Promise<void> => {
    await apiClient.post('/auth/password', data);
  },

  logSessionExpired: async (_username?: string): Promise<void> => {
    // Optional analytics/logging
  },

  updateActivity: async (_username?: string): Promise<void> => {
    // Optional analytics/logging
  },
};
