import { ApiClient } from './api.client';
import type { ApiResponse } from './api.types';

interface LoginPayload {
  username: string;
  passwordHash: string; // The client hashes this before sending (as per SECURITY.md)
}

interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    username: string;
    role: string;
    permissions: string[];
  };
}

export const authService = {
  login: async (payload: LoginPayload) => {
    return ApiClient.post<ApiResponse<AuthResponse>>('/auth/login', payload);
  },
  
  logout: async () => {
    return ApiClient.post<void>('/auth/logout', {});
  },
  
  refresh: async () => {
    return ApiClient.post<ApiResponse<AuthResponse>>('/auth/refresh', {});
  }
};
