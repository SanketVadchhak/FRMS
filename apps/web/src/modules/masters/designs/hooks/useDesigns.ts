import { useQuery } from '@tanstack/react-query';
import { designService } from '../services/design.service';
import { QUERY_KEYS } from '@/constants';

export function useDesigns() {
  return useQuery({
    queryKey: [QUERY_KEYS.DESIGNS],
    queryFn: () => designService.getDesigns(),
  });
}
