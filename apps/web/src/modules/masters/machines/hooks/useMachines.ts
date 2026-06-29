import { useQuery } from '@tanstack/react-query';
import { machineService } from '../services/machine.service';
import { QUERY_KEYS } from '@/constants';

export function useMachines() {
  return useQuery({
    queryKey: [QUERY_KEYS.MACHINES],
    queryFn: () => machineService.getMachines(),
  });
}
