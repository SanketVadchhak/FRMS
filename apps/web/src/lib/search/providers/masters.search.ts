import { Cpu, Building2, Palette } from 'lucide-react';
import type { SearchProvider, GlobalSearchResult } from '../searchEngine';

// In a real app, these would come from actual stores/services. We mock them for now.
const MOCK_MACHINES = [
  { id: 'm1', name: 'Tajima-01', code: 'TJM01' },
  { id: 'm2', name: 'Barudan-01', code: 'BRD01' },
  { id: 'm3', name: 'SWF-01', code: 'SWF01' },
];

const MOCK_CLIENTS = [
  { id: 'c1', name: 'ABC Garments', contactPerson: 'John Doe' },
  { id: 'c2', name: 'XYZ Textiles', contactPerson: 'Jane Smith' },
  { id: 'c3', name: 'Global Fashions', contactPerson: 'Rajesh Kumar' },
];

const MOCK_DESIGNS = [
  { id: 'd1', name: 'Flower Logo', code: 'FL001' },
  { id: 'd2', name: 'Tiger Embroidery', code: 'TGR02' },
  { id: 'd3', name: 'Company Crest', code: 'CC003' },
];

export const machineSearchProvider: SearchProvider = {
  moduleId: 'Machines',
  search: (query: string): GlobalSearchResult[] => {
    const q = query.toLowerCase();
    const results: GlobalSearchResult[] = [];

    for (const machine of MOCK_MACHINES) {
      let score = 0;
      const name = machine.name.toLowerCase();
      const code = machine.code.toLowerCase();

      if (code === q) score = 100;
      else if (name === q) score = 90;
      else if (name.startsWith(q) || code.startsWith(q)) score = 80;
      else if (name.includes(q) || code.includes(q)) score = 50;

      if (score > 0) {
        results.push({
          id: machine.id,
          title: machine.name,
          subtitle: `Code: ${machine.code}`,
          moduleBadge: 'Machines',
          icon: Cpu,
          iconColor: 'text-gray-500',
          score,
          action: {
            type: 'navigate',
            path: '/settings/masters', // As an example
            state: { search: machine.name },
          }
        });
      }
    }
    return results;
  }
};

export const clientSearchProvider: SearchProvider = {
  moduleId: 'Clients',
  search: (query: string): GlobalSearchResult[] => {
    const q = query.toLowerCase();
    const results: GlobalSearchResult[] = [];

    for (const client of MOCK_CLIENTS) {
      let score = 0;
      const name = client.name.toLowerCase();
      const contact = client.contactPerson.toLowerCase();

      if (name === q) score = 100;
      else if (name.startsWith(q)) score = 80;
      else if (name.includes(q) || contact.includes(q)) score = 50;

      if (score > 0) {
        results.push({
          id: client.id,
          title: client.name,
          subtitle: `Contact: ${client.contactPerson}`,
          moduleBadge: 'Clients',
          icon: Building2,
          iconColor: 'text-indigo-500',
          score,
          action: {
            type: 'navigate',
            path: '/settings/masters', 
            state: { search: client.name },
          }
        });
      }
    }
    return results;
  }
};

export const designSearchProvider: SearchProvider = {
  moduleId: 'Designs',
  search: (query: string): GlobalSearchResult[] => {
    const q = query.toLowerCase();
    const results: GlobalSearchResult[] = [];

    for (const design of MOCK_DESIGNS) {
      let score = 0;
      const name = design.name.toLowerCase();
      const code = design.code.toLowerCase();

      if (code === q) score = 100;
      else if (name === q) score = 90;
      else if (name.startsWith(q) || code.startsWith(q)) score = 80;
      else if (name.includes(q) || code.includes(q)) score = 50;

      if (score > 0) {
        results.push({
          id: design.id,
          title: design.name,
          subtitle: `Code: ${design.code}`,
          moduleBadge: 'Designs',
          icon: Palette,
          iconColor: 'text-purple-500',
          score,
          action: {
            type: 'navigate',
            path: '/settings/masters', 
            state: { search: design.name },
          }
        });
      }
    }
    return results;
  }
};
