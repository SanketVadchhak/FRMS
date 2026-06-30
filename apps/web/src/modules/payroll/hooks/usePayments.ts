import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '../services/payment.service';
import type { CreatePaymentDto, Payment } from '@frms/shared';

export const PAYMENT_KEYS = {
  all: ['payments'] as const,
  lists: () => [...PAYMENT_KEYS.all, 'list'] as const,
};

export function usePayments() {
  return useQuery({
    queryKey: PAYMENT_KEYS.lists(),
    queryFn: () => paymentService.getPayments(),
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePaymentDto) => paymentService.createPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_KEYS.lists() });
    },
  });
}

export function useUpdatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Payment> }) => 
      paymentService.updatePayment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_KEYS.lists() });
    },
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => paymentService.deletePayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_KEYS.lists() });
    },
  });
}
