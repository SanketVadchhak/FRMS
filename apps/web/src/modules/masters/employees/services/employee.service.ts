import { apiClient } from '@/lib/apiClient';
import type { Employee, EmployeeCreateInput, EmployeeUpdateInput } from '@frms/shared';

export const employeeService = {
  getEmployees: async (): Promise<Employee[]> => {
    return apiClient.get<Employee[]>('/employees');
  },

  getEmployee: async (id: string): Promise<Employee> => {
    return apiClient.get<Employee>(`/employees/${id}`);
  },

  createEmployee: async (data: EmployeeCreateInput): Promise<Employee> => {
    return apiClient.post<Employee>('/employees', data);
  },

  updateEmployee: async (id: string, data: EmployeeUpdateInput): Promise<Employee> => {
    return apiClient.put<Employee>(`/employees/${id}`, data);
  },

  deleteEmployee: async (id: string): Promise<void> => {
    return apiClient.delete(`/employees/${id}`);
  }
};
