import { v4 as uuidv4 } from 'uuid';
import { mockUsersApi } from '../../user-roles/services/users.mock';
import type { AuthRecord, AuthLog } from '../types/auth.types';
import type { LoginInput } from '../schemas/auth.schema';
import type { User } from '@frms/shared';

// Constants
const AUTH_STORAGE_KEY = 'frms_mock_auth';
const AUTH_LOGS_KEY = 'frms_mock_auth_logs';
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes

// Helper to simulate network latency
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

let initialized = false;

// Ensure mock credentials exist
async function ensureInitialized() {
  if (initialized) return;
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
  
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (stored) {
    initialized = true;
    return;
  }

  const defaultRecords: AuthRecord[] = [
    {
      username: 'admin',
      passwordHash: await hashPassword('admin123'),
      failedAttempts: 0,
      lastLogin: null,
      lastActivityAt: null,
      passwordChangedAt: new Date().toISOString(),
      lockedUntil: null,
    },
    {
      username: 'supervisor1',
      passwordHash: await hashPassword('supervisor123'),
      failedAttempts: 0,
      lastLogin: null,
      lastActivityAt: null,
      passwordChangedAt: new Date().toISOString(),
      lockedUntil: null,
    },
    {
      username: 'operator1',
      passwordHash: await hashPassword('operator123'),
      failedAttempts: 0,
      lastLogin: null,
      lastActivityAt: null,
      passwordChangedAt: new Date().toISOString(),
      lockedUntil: null,
    },
  ];

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(defaultRecords));
  initialized = true;
}

function getAuthRecords(): AuthRecord[] {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveAuthRecords(records: AuthRecord[]) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(records));
}

function logAuthEvent(username: string, action: AuthLog['action']) {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
  
  const logsStr = localStorage.getItem(AUTH_LOGS_KEY);
  const logs: AuthLog[] = logsStr ? JSON.parse(logsStr) : [];
  logs.push({
    id: uuidv4(),
    username,
    action,
    timestamp: new Date().toISOString(),
  });
  localStorage.setItem(AUTH_LOGS_KEY, JSON.stringify(logs));
}

export const mockAuthApi = {
  login: async (credentials: LoginInput): Promise<{ user: User; accessToken: string }> => {
    await ensureInitialized();
    await delay(600);
    const records = getAuthRecords();
    const recordIndex = records.findIndex((r) => r.username === credentials.username);

    if (recordIndex === -1) {
      logAuthEvent(credentials.username, 'failed_login');
      throw new Error('Invalid credentials');
    }

    const record = records[recordIndex]!;

    // Check lockout
    if (record.lockedUntil) {
      const lockTime = new Date(record.lockedUntil).getTime();
      if (Date.now() < lockTime) {
        throw new Error('Account is temporarily locked. Please try again later.');
      }
      // Lock expired
      record.lockedUntil = null;
      record.failedAttempts = 0;
    }

    const hash = await hashPassword(credentials.password);
    if (record.passwordHash !== hash) {
      record.failedAttempts += 1;
      if (record.failedAttempts >= MAX_FAILED_ATTEMPTS) {
        record.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS).toISOString();
      }
      saveAuthRecords(records);
      logAuthEvent(credentials.username, 'failed_login');
      throw new Error('Invalid credentials');
    }

    // Success
    record.failedAttempts = 0;
    record.lockedUntil = null;
    record.lastLogin = new Date().toISOString();
    record.lastActivityAt = new Date().toISOString();
    saveAuthRecords(records);

    // Fetch full user details from user mock
    const users = await mockUsersApi.getUsers();
    const user = users.find((u) => u.username === credentials.username);

    if (!user) {
      throw new Error('User profile not found in domain models');
    }
    
    // Ensure default preferences exist
    if (!user.preferences) {
      user.preferences = {
        theme: 'system',
        language: 'en',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '12h',
      };
    }

    logAuthEvent(credentials.username, 'login');
    
    return {
      user,
      accessToken: `mock-token-${uuidv4()}`,
    };
  },

  logout: async (username: string): Promise<void> => {
    await ensureInitialized();
    await delay(300);
    logAuthEvent(username, 'logout');
  },

  updateActivity: async (username: string): Promise<void> => {
    await ensureInitialized();
    const records = getAuthRecords();
    const record = records.find((r) => r.username === username);
    if (record) {
      record.lastActivityAt = new Date().toISOString();
      saveAuthRecords(records);
    }
  },

  changePassword: async (username: string, currentPass: string, newPass: string): Promise<void> => {
    await ensureInitialized();
    await delay(600);
    const records = getAuthRecords();
    const record = records.find((r) => r.username === username);
    if (!record) throw new Error('User not found');

    const currentHash = await hashPassword(currentPass);
    if (record.passwordHash !== currentHash) {
      throw new Error('Invalid current password');
    }

    record.passwordHash = await hashPassword(newPass);
    record.passwordChangedAt = new Date().toISOString();
    saveAuthRecords(records);

    logAuthEvent(username, 'password_changed');
  },
  
  logSessionExpired: async (username: string): Promise<void> => {
    await ensureInitialized();
    logAuthEvent(username, 'session_expired');
  }
};
