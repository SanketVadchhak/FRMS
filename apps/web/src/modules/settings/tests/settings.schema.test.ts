import { describe, it, expect } from 'vitest';
import { companySettingsSchema } from '@frms/shared';

describe('Company Settings Schema Validation', () => {
  it('should validate valid company settings', () => {
    const validData = {
      name: 'Test Corp',
      address: '123 Test St',
      phone: '1234567890',
      email: 'test@corp.com',
      gstNumber: 'GST123',
    };
    
    const result = companySettingsSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject missing required fields', () => {
    const invalidData = {
      name: '',
      address: '',
      phone: '',
      email: 'invalid-email',
    };
    
    const result = companySettingsSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success && result.error) {
      expect(result.error.issues.length).toBeGreaterThan(0);
    }
  });
});
