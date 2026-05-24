import { useQuery } from '@tanstack/react-query';
import { groupApi } from '@features/groups/services/groupApi';

export function useGroups(athleteId: string) {
  return useQuery({
    queryKey: ['groups', athleteId],
    queryFn: () => groupApi.listByAthlete(athleteId),
    enabled: !!athleteId,
  });
}

export function useFavoriteGroupDetails(favoriteId: string | null, clearFavoriteGroup: () => Promise<void>) {
  return useQuery({
    queryKey: ['group', favoriteId],
    queryFn: async () => {
      try {
        return await groupApi.findById(favoriteId!);
      } catch (error: any) {
        if (error.response?.status === 403 || error.response?.status === 404) {
          await clearFavoriteGroup();
          return null;
        }
        throw error;
      }
    },
    enabled: !!favoriteId,
    retry: false,
  });
}
