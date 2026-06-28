import type { Employee, EmployeeFormValues } from '@frms/shared';
import type { EmployeeService } from './employee.service';

const STORAGE_KEY = 'frms_mock_employees';

// Wait helper to simulate network latency
const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

// Initial mock data if empty
const DEFAULT_EMPLOYEES: Employee[] = [
  {
    id: 'emp_1',
    name: 'Rajesh Kumar',
    mobile: '+919876543210',
    joiningDate: '2023-01-15',
    hourlyRate: 150,
    status: 'ACTIVE',
    notes: 'Senior embroiderer',
  },
  {
    id: 'emp_2',
    name: 'Amit Patel',
    mobile: '+919876543211',
    joiningDate: '2023-06-20',
    hourlyRate: 120,
    status: 'ACTIVE',
  },
];

class MockEmployeeService implements EmployeeService {
  private getEmployeesFromStorage(): Employee[] {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      this.saveEmployeesToStorage(DEFAULT_EMPLOYEES);
      return DEFAULT_EMPLOYEES;
    }
    return JSON.parse(data);
  }

  private saveEmployeesToStorage(employees: Employee[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
  }

  async getEmployees(): Promise<Employee[]> {
    await delay();
    return this.getEmployeesFromStorage();
  }

  async getEmployeeById(id: string): Promise<Employee> {
    await delay();
    const employees = this.getEmployeesFromStorage();
    const employee = employees.find((e) => e.id === id);
    if (!employee) throw new Error('Employee not found');
    return employee;
  }

  async createEmployee(data: EmployeeFormValues): Promise<Employee> {
    await delay();
    const employees = this.getEmployeesFromStorage();
    
    const newEmployee: Employee = {
      ...data,
      id: `emp_${Date.now()}`,
      status: data.status || 'ACTIVE',
    } as Employee;
    
    this.saveEmployeesToStorage([...employees, newEmployee]);
    return newEmployee;
  }

  async updateEmployee(id: string, data: Partial<EmployeeFormValues>): Promise<Employee> {
    await delay();
    const employees = this.getEmployeesFromStorage();
    const index = employees.findIndex((e) => e.id === id);
    
    if (index === -1) throw new Error('Employee not found');
    
    const updatedEmployee = { ...employees[index], ...data } as Employee;
    employees[index] = updatedEmployee;
    this.saveEmployeesToStorage(employees);
    
    return updatedEmployee;
  }

  async deactivateEmployee(id: string): Promise<Employee> {
    return this.updateEmployee(id, { status: 'INACTIVE' });
  }

  async activateEmployee(id: string): Promise<Employee> {
    return this.updateEmployee(id, { status: 'ACTIVE' });
  }
}

export const employeeService = new MockEmployeeService();
