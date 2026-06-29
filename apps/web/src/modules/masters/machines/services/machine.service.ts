import { mockMachineService } from './machine.mock';


// Environment variable toggle for real API vs mock could go here.
// For now, returning mock service.
export const machineService = mockMachineService;
