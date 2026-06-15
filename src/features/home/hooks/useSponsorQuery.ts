import { useQuery } from '@tanstack/react-query';
import { httpClient } from '@lib/httpClient';
import { queryKeys } from '@lib/queryKeys';
import type { SponsorBannerData } from '@ui/composites/SponsorBanner';

export function useSponsorQuery(placement: string) {
  return useQuery<SponsorBannerData | null>({
    queryKey: queryKeys.sponsor(placement),
    queryFn: async () => {
      const response = await httpClient.get<SponsorBannerData | null>(
        '/marketplace/sponsor',
        { params: { placement } }
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos de cache
  });
}
