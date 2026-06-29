import { mockAuthApi } from './auth.mock';
import type { LoginInput, ChangePasswordInput } from '../schemas/auth.schema';
import type { User } from '@frms/shared';

export const authService = {
  login: async (credentials: LoginInput): Promise<{ user: User; accessToken: string }> => {
    // In production, this would be an axios/fetch call to /api/v1/auth/login
    return mockAuthApi.login(credentials);
  },

  logout: async (username: string): Promise<void> => {
    // In production, /api/v1/auth/logout
    return mockAuthApi.logout(username);
  },

  updateActivity: async (username: string): Promise<void> => {
    // In production, this might be handled via middleware or a lightweight ping
    return mockAuthApi.updateActivity(username);
  },

  changePassword: async (username: string, data: ChangePasswordInput): Promise<void> => {
    // In production, /api/v1/auth/password
    return mockAuthApi.changePassword(username, data.currentPassword, data.newPassword);
  },

  logSessionExpired: async (username: string): Promise<void> => {
    // Inform backend that frontend dropped the session
    return mockAuthApi.logSessionExpired(username);
  }
};
