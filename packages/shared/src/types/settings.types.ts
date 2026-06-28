import type { z } from 'zod';
import type { companySettingsSchema, themeModeSchema } from '../schemas/settings.schema';

export type CompanySettings = z.infer<typeof companySettingsSchema>;
export type ThemeMode = z.infer<typeof themeModeSchema>;
