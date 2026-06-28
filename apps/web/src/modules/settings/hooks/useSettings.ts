import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SettingsService } from '../services/settings.service';
import type { CompanySettings } from '@frms/shared';
import { QUERY_KEYS } from '@/constants';

export const useCompanySettings = () => {
  return useQuery({
    queryKey: QUERY_KEYS.SETTINGS.COMPANY,
    queryFn: () => SettingsService.getCompanySettings(),
  });
};

export const useUpdateCompanySettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CompanySettings) => SettingsService.updateCompanySettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SETTINGS.COMPANY });
    },
  });
};
