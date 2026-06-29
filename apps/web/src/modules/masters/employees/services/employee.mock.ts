import type { Employee, EmployeeFormValues } from '@frms/shared';
import type { EmployeeService } from './employee.service';
import { STORAGE_KEYS } from '@/constants';

const now = () => new Date().toISOString();
const delay = (ms = 500) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// ─── Seed Data ────────────────────────────────────────────────────────────────
const DEFAULT_EMPLOYEES: Employee[] = [
  {
    id: 'emp_1',
    name: 'Rajesh Kumar',
    mobile: '+919876543210',
    joiningDate: '2023-01-15',
    hourlyRate: 150,
    status: 'ACTIVE',
    notes: 'Senior embroiderer',
    createdAt: '2023-01-15T09:00:00.000Z',
    updatedAt: '2023-01-15T09:00:00.000Z',
  },
  {
    id: 'emp_2',
    name: 'Amit Patel',
    mobile: '+919876543211',
    joiningDate: '2023-06-20',
    hourlyRate: 120,
    status: 'ACTIVE',
    createdAt: '2023-06-20T09:00:00.000Z',
    updatedAt: '2023-06-20T09:00:00.000Z',
  },
  {
    id: 'emp_3',
    name: 'Priya Sharma',
    mobile: '+919876543212',
    joiningDate: '2024-02-01',
    hourlyRate: 130,
    status: 'ACTIVE',
    createdAt: '2024-02-01T09:00:00.000Z',
    updatedAt: '2024-02-01T09:00:00.000Z',
  },
];

// ─── Storage Helpers ──────────────────────────────────────────────────────────
class MockEmployeeService implements EmployeeService {
  private getFromStorage(): Employee[] {
    const data = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    if (!data) {
      this.saveToStorage(DEFAULT_EMPLOYEES);
      return DEFAULT_EMPLOYEES;
    }
    return JSON.parse(data) as Employee[];
  }

  private saveToStorage(employees: Employee[]): void {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
  }

  async getEmployees(): Promise<Employee[]> {
    await delay();
    return this.getFromStorage();
  }

  async getEmployeeById(id: string): Promise<Employee> {
    await delay();
    const employees = this.getFromStorage();
    const employee = employees.find((e) => e.id === id);
    if (!employee) throw new Error(`Employee "${id}" not found`);
    return employee;
  }

  async createEmployee(data: EmployeeFormValues): Promise<Employee> {
    await delay();
    const employees = this.getFromStorage();

    const newEmployee: Employee = {
      ...data,
      id: `emp_${Date.now()}`,
      status: data.status ?? 'ACTIVE',
      createdAt: now(),
      updatedAt: now(),
    };

    this.saveToStorage([...employees, newEmployee]);
    return newEmployee;
  }

  async updateEmployee(id: string, data: Partial<EmployeeFormValues>): Promise<Employee> {
    await delay();
    const employees = this.getFromStorage();
    const index = employees.findIndex((e) => e.id === id);
    if (index === -1) throw new Error(`Employee "${id}" not found`);

    const updatedEmployee: Employee = {
      ...employees[index]!,
      ...data,
      updatedAt: now(),
    };

    employees[index] = updatedEmployee;
    this.saveToStorage(employees);
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
