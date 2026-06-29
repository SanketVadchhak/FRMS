import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { productionService } from '../services/production.service';
import { QUERY_KEYS } from '@/constants';
import type { ProductionEntry } from '@frms/shared';

export function useProductionEntries() {
  return useQuery({
    queryKey: [QUERY_KEYS.PRODUCTION.LIST],
    queryFn: () => productionService.getEntries(),
    staleTime: 30_000, // 30s — production data changes infrequently on factory floor
  });
}

export function useCreateProductionEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (entry: Omit<ProductionEntry, 'id' | 'createdAt' | 'updatedAt'>) =>
      productionService.createEntry(entry),
    onSuccess: () => {
      toast.success('Production entry created successfully');
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTION.LIST] });
    },
    onError: () => {
      toast.error('Failed to create entry');
    }
  });
}

export function useUpdateProductionEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<ProductionEntry> }) =>
      productionService.updateEntry(id, updates),
    onSuccess: (_, { id }) => {
      toast.success('Production entry updated successfully');
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTION.LIST] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTION.DETAIL(id) });
    },
    onError: () => {
      toast.error('Failed to update entry');
    }
  });
}

export function useApproveProductionEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productionService.approveEntry(id),
    onSuccess: (_, id) => {
      toast.success('Production entry approved');
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTION.LIST] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTION.DETAIL(id) });
    },
    onError: () => {
      toast.error('Failed to approve entry');
    }
  });
}

export function useRejectProductionEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      productionService.rejectEntry(id, reason),
    onSuccess: (_, { id }) => {
      toast.success('Production entry rejected');
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTION.LIST] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTION.DETAIL(id) });
    },
    onError: () => {
      toast.error('Failed to reject entry');
    }
  });
}

export function useBulkApproveProductionEntries() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => productionService.bulkApproveEntries(ids),
    onSuccess: () => {
      toast.success('Selected entries approved successfully');
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTION.LIST] });
    },
    onError: () => {
      toast.error('Failed to bulk approve entries');
    }
  });
}
