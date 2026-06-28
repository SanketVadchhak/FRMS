import { describe, it, expect } from 'vitest';
import { userCreateSchema, UserRole, UserStatus } from '@frms/shared';

describe('userCreateSchema', () => {
  it('validates a correct user payload', () => {
    const validData = {
      username: 'admin',
      password: 'securepassword',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    };
    
    const result = userCreateSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('fails if username is too short', () => {
    const invalidData = {
      username: 'ad',
      password: 'securepassword',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    };
    
    const result = userCreateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Username must be at least 3 characters");
    }
  });

  it('fails if password is too short', () => {
    const invalidData = {
      username: 'admin',
      password: 'pass',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    };
    
    const result = userCreateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Password must be at least 6 characters");
    }
  });
});
