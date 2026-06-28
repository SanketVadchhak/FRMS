import type { Employee, EmployeeFormValues } from '@frms/shared';

export interface EmployeeService {
  getEmployees(): Promise<Employee[]>;
  getEmployeeById(id: string): Promise<Employee>;
  createEmployee(data: EmployeeFormValues): Promise<Employee>;
  updateEmployee(id: string, data: Partial<EmployeeFormValues>): Promise<Employee>;
  deactivateEmployee(id: string): Promise<Employee>;
  activateEmployee(id: string): Promise<Employee>;
}
