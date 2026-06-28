import type { User, UserCreateInput, UserUpdateInput } from '@frms/shared';
import { mockUsersApi } from './users.mock';

export const UsersService = {
  getUsers: async (): Promise<User[]> => {
    // In future, replace with: return ApiClient.get<User[]>('/users');
    return mockUsersApi.getUsers();
  },

  getUserById: async (id: string): Promise<User> => {
    // In future, replace with: return ApiClient.get<User>(`/users/${id}`);
    return mockUsersApi.getUserById(id);
  },

  createUser: async (data: UserCreateInput): Promise<User> => {
    // In future, replace with: return ApiClient.post<User>('/users', data);
    return mockUsersApi.createUser(data);
  },

  updateUser: async (id: string, data: UserUpdateInput): Promise<User> => {
    // In future, replace with: return ApiClient.put<User>(`/users/${id}`, data);
    return mockUsersApi.updateUser(id, data);
  }
};
