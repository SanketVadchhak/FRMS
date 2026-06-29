/**
 * Production Service
 *
 * This is the single swap point between the mock backend and the real API.
 * To migrate to a real backend, replace the import below with an
 * HttpProductionService that calls the API endpoints.
 *
 * Future swap:
 *   export { httpProductionService as productionService } from './production.http';
 */
import { mockProductionService } from './production.mock';

export const productionService = mockProductionService;
