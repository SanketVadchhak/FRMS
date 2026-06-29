import { z } from 'zod';

export enum MachineStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
}

export const machineSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Machine name is required'),
  status: z.nativeEnum(MachineStatus).default(MachineStatus.ACTIVE),
});

export type Machine = z.infer<typeof machineSchema>;
