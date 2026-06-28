import { describe, it, expect } from 'vitest';
import { employeeSchema } from '@frms/shared';

describe('Employee Schema', () => {
  it('should validate a valid active employee without optional fields', () => {
    const data = {
      name: 'John Doe',
      mobile: '+919876543210',
      joiningDate: '2023-10-15',
      hourlyRate: 150,
      status: 'ACTIVE',
    };

    const result = employeeSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should validate a valid employee with all fields', () => {
    const data = {
      name: 'Jane Doe',
      mobile: '9876543210',
      joiningDate: '2023-10-15',
      hourlyRate: 200,
      status: 'INACTIVE',
      notes: 'Some notes',
      bankName: 'HDFC',
      accountNumber: '1234567890',
      ifscCode: 'HDFC0001234',
    };

    const result = employeeSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should reject invalid mobile number formats', () => {
    const data = {
      name: 'John Doe',
      mobile: '123', // Too short
      joiningDate: '2023-10-15',
      hourlyRate: 150,
    };

    const result = employeeSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject negative hourly rates', () => {
    const data = {
      name: 'John Doe',
      mobile: '+919876543210',
      joiningDate: '2023-10-15',
      hourlyRate: -50,
    };

    const result = employeeSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject invalid date format', () => {
    const data = {
      name: 'John Doe',
      mobile: '+919876543210',
      joiningDate: '15-10-2023', // Wrong format
      hourlyRate: 150,
    };

    const result = employeeSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
  
  it('should reject invalid IFSC code format', () => {
    const data = {
      name: 'John Doe',
      mobile: '+919876543210',
      joiningDate: '2023-10-15',
      hourlyRate: 150,
      ifscCode: 'INVALIDCODE', // Must be 4 letters, 0, 6 alphanumeric
    };

    const result = employeeSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
