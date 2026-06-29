import { z } from 'zod';

export enum DesignStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export const designSchema = z.object({
  id: z.string(),
  code: z.string().min(1, 'Design code is required'),
  name: z.string().min(1, 'Design name is required'),
  status: z.nativeEnum(DesignStatus).default(DesignStatus.ACTIVE),
});

export type Design = z.infer<typeof designSchema>;
