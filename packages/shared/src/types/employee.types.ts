import type { z } from 'zod';
import type { employeeSchema, employeeStatusEnum } from '../schemas/employee.schema';

export type EmployeeStatus = z.infer<typeof employeeStatusEnum>;
export type Employee = z.infer<typeof employeeSchema>;
export type EmployeeFormValues = Omit<Employee, 'id'>;
