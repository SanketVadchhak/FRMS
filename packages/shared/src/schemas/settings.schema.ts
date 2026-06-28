import { z } from 'zod';

export const companySettingsSchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().min(5, 'Valid phone number is required'),
  email: z.string().email('Valid email is required'),
  gstNumber: z.string().optional(),
});

export const themeModeSchema = z.enum(['light', 'dark', 'system']);
