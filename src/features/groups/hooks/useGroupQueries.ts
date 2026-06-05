import { useQuery, useQueryClient } from '@tanstack/react-query';
import { groupApi } from '@features/groups/services/groupApi';
import { GroupResponse } from '@features/groups/groupTypes';

export function useGroups(athleteId: string) {
  return useQuery({
    queryKey: ['groups', athleteId],
    queryFn: () => groupApi.listByAthlete(athleteId),
    enabled: !!athleteId,
  });
}

export function useFavoriteGroupDetails(
  favoriteId: string | null,
  athleteId: string,
  clearFavoriteGroup: () => Promise<void>,
) {
  const queryClient = useQueryClient();
  const findCachedFavoriteGroup = () => {
    const cachedGroups = queryClient.getQueryData<GroupResponse[]>(['groups', athleteId]) ?? [];
    return cachedGroups.find((group) => group.id === favoriteId);
  };

  return useQuery({
    queryKey: ['group', favoriteId],
    queryFn: async () => {
      try {
        const cachedGroup = findCachedFavoriteGroup();
        if (cachedGroup) return cachedGroup;

        return await groupApi.findById(favoriteId!);
      } catch (error: any) {
        if (error.response?.status === 403 || error.response?.status === 404) {
          await clearFavoriteGroup();
          return null;
        }
        throw error;
      }
    },
    initialData: findCachedFavoriteGroup,
    enabled: !!favoriteId,
    retry: false,
  });
}
