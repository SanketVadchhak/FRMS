import type { UserRole, UserStatus } from '../enums/user.enums';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt?: string | null;
  preferences?: UserPreferences;
  createdAt: string;
  updatedAt: string;
}
