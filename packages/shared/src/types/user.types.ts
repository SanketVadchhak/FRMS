import type { UserRole, UserStatus } from '../enums/user.enums';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}
