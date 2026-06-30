import { User } from 'lucide-react';
import type { SearchProvider, GlobalSearchResult } from '../searchEngine';
import { employeeService } from '@/modules/masters/employees/services/employee.mock';
import { ROUTES } from '@/constants/routes';

export const employeesSearchProvider: SearchProvider = {
  moduleId: 'Employees',
  search: async (query: string): Promise<GlobalSearchResult[]> => {
    const q = query.toLowerCase();
    const results: GlobalSearchResult[] = [];
    const employees = await employeeService.getEmployees();

    for (const emp of employees) {
      let score = 0;
      
      const code = emp.id?.toLowerCase() || '';
      const name = emp.name.toLowerCase();
      const mobile = emp.mobile.toLowerCase();

      if (code === q) score = 100;
      else if (mobile === q) score = 90;
      else if (name.startsWith(q) || code.startsWith(q)) score = 80;
      else if (name.includes(q) || code.includes(q) || mobile.includes(q)) score = 50;

      if (score > 0) {
        results.push({
          id: emp.id || '',
          title: emp.name,
          subtitle: `${emp.id} • ${emp.mobile}`,
          moduleBadge: 'Employees',
          icon: User,
          iconColor: 'text-blue-500',
          score,
          action: {
            type: 'navigate',
            path: ROUTES.MASTERS.EMPLOYEES,
            state: { search: emp.name, highlight: emp.id },
          }
        });
      }
    }

    return results;
  }
};
