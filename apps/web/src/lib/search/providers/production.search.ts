import { Package } from 'lucide-react';
import type { SearchProvider, GlobalSearchResult } from '../searchEngine';
import { productionService } from '@/modules/production/services/production.service';
import { ROUTES } from '@/constants/routes';

export const productionSearchProvider: SearchProvider = {
  moduleId: 'production',
  search: async (query: string): Promise<GlobalSearchResult[]> => {
    const q = query.toLowerCase();
    const results: GlobalSearchResult[] = [];
    const entries = await productionService.getEntries();

    for (const prod of entries) {
      let score = 0;
      
      const id = prod.id?.toLowerCase() || '';
      const empName = prod.employeeId?.toLowerCase() || '';
      const details = prod.details || [];
      const design = details.map((d: any) => d.designName).join(' ').toLowerCase();

      if (id === q) score = 100;
      else if (id.startsWith(q)) score = 80;
      else if (
        empName.includes(q) ||
        design.includes(q) ||
        id.includes(q)
      ) score = 50;
      
      if (score > 0) {
        results.push({
          id: prod.id!,
          title: `Production Entry ${prod.id?.substring(0, 8)}`,
          subtitle: `Employee: ${prod.employeeId} - Date: ${new Date(prod.date).toLocaleDateString()}`,
          moduleBadge: 'production',
          icon: Package,
          action: {
            type: 'navigate',
            path: ROUTES.PRODUCTION.LIST
          },
          score,
        });
      }
    }
    
    return results;
  }
};
