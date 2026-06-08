import { useQuery, useQueryClient } from '@tanstack/react-query';
import { groupApi } from '@features/groups/services/groupApi';
import { GroupResponse } from '@features/groups/groupTypes';
import { queryKeys } from '@lib/queryKeys';

export function useGroups(athleteId: string) {
  return useQuery({
    queryKey: queryKeys.groups(athleteId),
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
    const cachedGroups = queryClient.getQueryData<GroupResponse[]>(queryKeys.groups(athleteId)) ?? [];
    return cachedGroups.find((group) => group.id === favoriteId);
  };

  return useQuery({
    queryKey: queryKeys.favoriteGroup(favoriteId),
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
