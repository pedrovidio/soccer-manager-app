import { useCallback } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@features/auth/useAuthStore';
import { groupApi } from '@features/groups/services/groupApi';
import { queryKeys } from '@lib/queryKeys';

export function useGroupMatchesScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const router = useRouter();
  const athleteId = useAuthStore((state) => state.athleteId) ?? '';

  const query = useQuery({
    queryKey: groupId ? queryKeys.groupHome(groupId) : queryKeys.groupHomes(),
    queryFn: () => groupApi.getHome(groupId!, athleteId),
    enabled: !!groupId && !!athleteId,
  });

  const goCreateMatch = useCallback(() => {
    router.push({ pathname: '/matches/create-match', params: { groupId } } as any);
  }, [groupId, router]);

  const goMatch = useCallback((matchId: string, isAdmin: boolean) => {
    router.push({ pathname: '/matches/match-home', params: { matchId, groupId, isAdmin: isAdmin ? '1' : '0' } } as any);
  }, [groupId, router]);

  return {
    data: query.data,
    error: query.error,
    goCreateMatch,
    goMatch,
    groupId,
    isError: query.isError,
    isLoading: query.isLoading,
    refetch: query.refetch,
    router,
  };
}
