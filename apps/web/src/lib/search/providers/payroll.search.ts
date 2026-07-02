import { Banknote } from 'lucide-react';
import type { SearchProvider, GlobalSearchResult } from '../searchEngine';
import { payrollService } from '@/modules/payroll/services/payroll.service';
import { ROUTES } from '@/constants/routes';

export const payrollSearchProvider: SearchProvider = {
  moduleId: 'Payroll',
  search: async (query: string): Promise<GlobalSearchResult[]> => {
    const q = query.toLowerCase();
    const results: GlobalSearchResult[] = [];
    const payrolls = await payrollService.getPayrolls();

    for (const payroll of payrolls) {
      let score = 0;
      
      const id = payroll.id?.toLowerCase() || '';
      const period = (payroll.payrollPeriodStart + ' to ' + payroll.payrollPeriodEnd).toLowerCase();
      const empName = payroll.employeeName?.toLowerCase() || '';

      if (id === q) score = 100;
      else if (period.startsWith(q)) score = 80;
      else if (id.includes(q) || period.includes(q) || empName.includes(q)) score = 50;

      if (score > 0) {
        results.push({
          id: payroll.id || '',
          title: `Payroll ${payroll.payrollPeriodStart} to ${payroll.payrollPeriodEnd}`,
          subtitle: `${payroll.employeeName || 'Unknown Employee'} • ID: ${(payroll.id || '').substring(0, 8)}`,
          moduleBadge: 'Payroll',
          icon: Banknote,
          iconColor: 'text-green-500',
          score,
          action: {
            type: 'navigate',
            path: ROUTES.PAYROLL.DASHBOARD,
            state: { search: payroll.employeeName, highlight: payroll.id },
          }
        });
      }
    }

    return results;
  }
};
