import type { User } from '@frms/shared';

export interface AuthRecord {
  username: string;
  passwordHash: string;
  failedAttempts: number;
  lastLogin: string | null;
  lastActivityAt: string | null;
  passwordChangedAt: string | null;
  lockedUntil: string | null;
}

export interface AuthLog {
  id: string;
  username: string;
  action: 'login' | 'logout' | 'failed_login' | 'password_changed' | 'session_expired';
  timestamp: string;
}

export interface AuthSession {
  accessToken: string;
  user: User; // We'll refine this later using the shared User type
  expiresAt: string;
}
