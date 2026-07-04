import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { machineService } from '../services/machine.service';
import { QUERY_KEYS } from '@/constants';
import type { MachineCreateInput, MachineUpdateInput } from '@frms/shared';
import { toast } from 'sonner';

export function useMachines() {
  return useQuery({
    queryKey: [QUERY_KEYS.MACHINES],
    queryFn: () => machineService.getMachines(),
  });
}

export function useCreateMachine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: MachineCreateInput) => machineService.createMachine(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MACHINES] });
      toast.success('Machine created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create machine');
      console.error(error);
    },
  });
}

export function useUpdateMachine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MachineUpdateInput }) =>
      machineService.updateMachine(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MACHINES] });
      toast.success('Machine updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update machine');
      console.error(error);
    },
  });
}

export function useDeleteMachine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => machineService.deleteMachine(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MACHINES] });
      toast.success('Machine deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete machine');
      console.error(error);
    },
  });
}
