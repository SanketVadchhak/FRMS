import { searchEngine } from './searchEngine';
import { employeesSearchProvider } from './providers/employees.search';
import { productionSearchProvider } from './providers/production.search';
import { payrollSearchProvider } from './providers/payroll.search';
import { machineSearchProvider, clientSearchProvider, designSearchProvider } from './providers/masters.search';

let registered = false;

export function registerSearchProviders() {
  if (registered) return;
  
  searchEngine.registerProvider(employeesSearchProvider);
  searchEngine.registerProvider(productionSearchProvider);
  searchEngine.registerProvider(payrollSearchProvider);
  searchEngine.registerProvider(machineSearchProvider);
  searchEngine.registerProvider(clientSearchProvider);
  searchEngine.registerProvider(designSearchProvider);
  
  registered = true;
}
