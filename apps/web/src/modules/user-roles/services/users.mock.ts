import { UserRole, UserStatus } from '@frms/shared';
import type { User, UserCreateInput, UserUpdateInput } from '@frms/shared';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'frms_mock_users';

const initialUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    lastLoginAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    username: 'supervisor1',
    role: UserRole.SUPERVISOR,
    status: UserStatus.ACTIVE,
    lastLoginAt: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 100000000).toISOString(),
    updatedAt: new Date(Date.now() - 100000000).toISOString(),
  },
  {
    id: '3',
    username: 'operator1',
    role: UserRole.OPERATOR,
    status: UserStatus.ACTIVE,
    lastLoginAt: null,
    createdAt: new Date(Date.now() - 200000000).toISOString(),
    updatedAt: new Date(Date.now() - 200000000).toISOString(),
  }
];

// Helper to simulate network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getStoredUsers = (): User[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialUsers));
  return initialUsers;
};

const saveUsers = (users: User[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
};

export const mockUsersApi = {
  getUsers: async (): Promise<User[]> => {
    await delay(500);
    return getStoredUsers();
  },

  getUserById: async (id: string): Promise<User> => {
    await delay(300);
    const users = getStoredUsers();
    const user = users.find(u => u.id === id);
    if (!user) throw new Error('User not found');
    return user;
  },

  createUser: async (data: UserCreateInput): Promise<User> => {
    await delay(600);
    const users = getStoredUsers();
    
    if (users.some(u => u.username === data.username)) {
      throw new Error('Username already exists');
    }

    const newUser: User = {
      id: uuidv4(),
      username: data.username,
      role: data.role,
      status: data.status,
      lastLoginAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveUsers([...users, newUser]);
    return newUser;
  },

  updateUser: async (id: string, data: UserUpdateInput): Promise<User> => {
    await delay(600);
    const users = getStoredUsers();
    const index = users.findIndex(u => u.id === id);
    
    if (index === -1) throw new Error('User not found');

    // Check username uniqueness if changed
    if (users.some(u => u.username === data.username && u.id !== id)) {
      throw new Error('Username already exists');
    }

    const updatedUser: User = {
      ...users[index],
      username: data.username,
      role: data.role,
      status: data.status,
      updatedAt: new Date().toISOString(),
    } as User;

    users[index] = updatedUser;
    saveUsers(users);
    
    return updatedUser;
  },
};
