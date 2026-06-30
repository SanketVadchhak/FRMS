import { Package } from 'lucide-react';
import type { SearchProvider, GlobalSearchResult } from '../searchEngine';
import { mockProductionService } from '@/modules/production/services/production.mock';
import { ROUTES } from '@/constants/routes';

export const productionSearchProvider: SearchProvider = {
  moduleId: 'Production',
  search: async (query: string): Promise<GlobalSearchResult[]> => {
    const q = query.toLowerCase();
    const results: GlobalSearchResult[] = [];
    const entries = await mockProductionService.getEntries();

    for (const prod of entries) {
      let score = 0;
      
      const id = prod.id?.toLowerCase() || '';
      const empName = prod.employeeId?.toLowerCase() || '';
      const design = prod.details.map(d => d.designName).join(' ').toLowerCase();

      if (id === q) score = 100;
      else if (id.startsWith(q)) score = 80;
      else if (
        id.includes(q) || 
        empName.includes(q) || 
        design.includes(q)
      ) {
        score = 50;
      }

      if (score > 0) {
        // Find best subtitle context based on query match (or just default to Employee + Date)
        const dateStr = new Date(prod.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        results.push({
          id: prod.id || '',
          title: prod.id || `Production on ${dateStr}`,
          subtitle: `${dateStr} • ${prod.employeeId || 'Unknown'}`,
          moduleBadge: 'Production',
          icon: Package,
          iconColor: 'text-orange-500',
          score,
          action: {
            type: 'navigate',
            path: ROUTES.PRODUCTION.LIST,
            state: { search: prod.id, highlight: prod.id },
          }
        });
      }
    }

    return results;
  }
};
