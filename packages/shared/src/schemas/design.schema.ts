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

export const createDesignSchema = designSchema.omit({ id: true });
export const updateDesignSchema = designSchema.partial();

export type DesignCreateInput = z.infer<typeof createDesignSchema>;
export type DesignUpdateInput = z.infer<typeof updateDesignSchema>;
