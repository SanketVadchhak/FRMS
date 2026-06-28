import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UsersService } from '../services/users.service';
import type { UserCreateInput, UserUpdateInput } from '@frms/shared';
import { QUERY_KEYS } from '@/constants';

export const useUsers = () => {
  return useQuery({
    queryKey: QUERY_KEYS.USERS.LIST,
    queryFn: () => UsersService.getUsers(),
  });
};

export const useUser = (id?: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.USERS.DETAIL(id || ''),
    queryFn: () => UsersService.getUserById(id!),
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UserCreateInput) => UsersService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS.LIST });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UserUpdateInput }) => 
      UsersService.updateUser(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS.LIST });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS.DETAIL(variables.id) });
    },
  });
};
