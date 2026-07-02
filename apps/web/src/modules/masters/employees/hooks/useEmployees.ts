import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants';
import type { EmployeeFormValues, EmployeeCreateInput, EmployeeUpdateInput } from '@frms/shared';
import { employeeService } from '../services/employee.service';
import { toast } from 'sonner';

export function useEmployees() {
  return useQuery({
    queryKey: QUERY_KEYS.EMPLOYEES.LIST,
    queryFn: () => employeeService.getEmployees(),
  });
}

export function useEmployee(id?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.EMPLOYEES.DETAIL(id as string),
    queryFn: () => employeeService.getEmployee(id as string),
    enabled: !!id,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EmployeeFormValues) => employeeService.createEmployee(data as EmployeeCreateInput),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EMPLOYEES.LIST });
      toast.success('Employee created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create employee');
      console.error(error);
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EmployeeFormValues> }) => 
      employeeService.updateEmployee(id, data as EmployeeUpdateInput),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EMPLOYEES.LIST });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EMPLOYEES.DETAIL(data.id!) });
      toast.success('Employee updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update employee');
      console.error(error);
    },
  });
}

export function useChangeEmployeeStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ACTIVE' | 'INACTIVE' }) => 
      employeeService.updateEmployee(id, { status } as EmployeeUpdateInput),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EMPLOYEES.LIST });
      toast.success(`Employee ${data?.status === 'ACTIVE' ? 'activated' : 'deactivated'} successfully`);
    },
    onError: (error) => {
      toast.error('Failed to change employee status');
      console.error(error);
    },
  });
}
