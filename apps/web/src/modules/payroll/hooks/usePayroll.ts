import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { payrollService } from '../services/payroll.service';
import { PAYMENT_KEYS } from './usePayments';

export const PAYROLL_KEYS = {
  all: ['payrolls'] as const,
  lists: () => [...PAYROLL_KEYS.all, 'list'] as const,
  previews: () => [...PAYROLL_KEYS.all, 'preview'] as const,
};

export function usePayrolls() {
  return useQuery({
    queryKey: PAYROLL_KEYS.lists(),
    queryFn: () => payrollService.getPayrolls(),
  });
}

export function usePreviewPayroll(start: string, end: string) {
  return useQuery({
    queryKey: [...PAYROLL_KEYS.previews(), start, end],
    queryFn: () => payrollService.previewPayroll(start, end),
    enabled: Boolean(start && end),
    retry: false, // Don't retry if it errors (e.g. overlap validation)
  });
}

export function useGeneratePayroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ start, end, notes }: { start: string; end: string; notes?: string }) => 
      payrollService.generatePayroll(start, end, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYROLL_KEYS.lists() });
    },
  });
}

export function useLockPayroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => payrollService.lockPayroll(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYROLL_KEYS.lists() });
    },
  });
}

export function useMarkPayrollPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => payrollService.markPaid(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYROLL_KEYS.lists() });
      // Marking paid also settles payments, so we invalidate those too
      queryClient.invalidateQueries({ queryKey: PAYMENT_KEYS.lists() });
    },
  });
}
