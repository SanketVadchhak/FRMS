import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productionService } from '../services/production.service';
import { QUERY_KEYS } from '@/constants';
import type { ProductionEntry } from '@frms/shared';

export function useProductionEntries() {
  return useQuery({
    queryKey: [QUERY_KEYS.PRODUCTION.LIST],
    queryFn: () => productionService.getEntries(),
  });
}

export function useCreateProductionEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (entry: Omit<ProductionEntry, 'id'>) => productionService.createEntry(entry),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTION.LIST] });
    },
  });
}

export function useUpdateProductionEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<ProductionEntry> }) =>
      productionService.updateEntry(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTION.LIST] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTION.DETAIL(id) });
    },
  });
}

export function useApproveProductionEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productionService.approveEntry(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTION.LIST] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTION.DETAIL(id) });
    },
  });
}

export function useRejectProductionEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => productionService.rejectEntry(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTION.LIST] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTION.DETAIL(id) });
    },
  });
}
