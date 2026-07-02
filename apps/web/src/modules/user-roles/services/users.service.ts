import { apiClient } from '@/lib/apiClient';
import type { User, UserCreateInput, UserUpdateInput } from '@frms/shared';

export const UsersService = {
  getUsers: async (): Promise<User[]> => {
    return apiClient.get<User[]>('/users');
  },

  getUserById: async (id: string): Promise<User> => {
    return apiClient.get<User>(`/users/${id}`);
  },

  createUser: async (data: UserCreateInput): Promise<User> => {
    return apiClient.post<User>('/users', data);
  },

  updateUser: async (id: string, data: UserUpdateInput): Promise<User> => {
    return apiClient.put<User>(`/users/${id}`, data);
  },
  
  deleteUser: async (id: string): Promise<void> => {
    return apiClient.delete(`/users/${id}`);
  }
};
