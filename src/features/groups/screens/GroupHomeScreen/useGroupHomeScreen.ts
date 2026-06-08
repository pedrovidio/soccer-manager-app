import { useCallback, useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@features/auth/useAuthStore';
import { groupApi } from '@features/groups/services/groupApi';
import { queryKeys } from '@lib/queryKeys';

export function useGroupHomeScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const router = useRouter();
  const athleteId = useAuthStore((state) => state.athleteId) ?? '';

  const groupQuery = useQuery({
    queryKey: groupId ? queryKeys.groupHome(groupId) : queryKeys.groupHomes(),
    queryFn: () => groupApi.getHome(groupId!, athleteId),
    enabled: !!groupId && !!athleteId,
  });

  const favoriteQuery = useQuery({
    queryKey: groupId ? queryKeys.favoriteSpotAthletes(groupId) : queryKeys.favoriteSpotAthletesAll(),
    queryFn: () => groupApi.listFavoriteSpotAthletes(groupId!, athleteId),
    enabled: !!groupId && !!athleteId && groupQuery.data?.isAdmin === true,
  });

  const financeQuery = useQuery({
    queryKey: groupId ? queryKeys.groupFinanceReport(groupId, athleteId, 'home-review', 20) : queryKeys.groupFinanceReportsAll(),
    queryFn: () => groupApi.financeReport(groupId!, athleteId, { page: 1, pageSize: 20 }),
    enabled: !!groupId && !!athleteId && groupQuery.data?.isAdmin === true,
  });

  const blockedCount = useMemo(
    () => groupQuery.data?.members.filter((member) => member.hasDebt || member.isInjured || member.isBlocked).length ?? 0,
    [groupQuery.data?.members],
  );

  const nextMatch = groupQuery.data?.upcomingMatches[0];

  const reviewPaymentsCount = useMemo(
    () => financeQuery.data?.payments.filter((payment) => payment.status === 'PENDING' && !!payment.paymentReportedAt).length ?? 0,
    [financeQuery.data?.payments],
  );

  const goEditGroup = useCallback(() => router.push({ pathname: '/groups/edit-group', params: { groupId } } as any), [groupId, router]);
  const goInviteAthlete = useCallback((groupName: string) => router.push({ pathname: '/groups/invite-athlete', params: { groupId, groupName } } as any), [groupId, router]);
  const goCreateMatch = useCallback(() => router.push({ pathname: '/matches/create-match', params: { groupId } } as any), [groupId, router]);
  const goFinance = useCallback((tab?: string) => router.push({ pathname: '/groups/group-finance', params: { groupId, ...(tab && { tab }) } } as any), [groupId, router]);
  const goMembers = useCallback((tab: string) => router.push({ pathname: '/groups/group-members', params: { groupId, tab } } as any), [groupId, router]);
  const goMatches = useCallback(() => router.push({ pathname: '/groups/group-matches', params: { groupId } } as any), [groupId, router]);
  const goMatch = useCallback((matchId: string, isAdmin: boolean) => {
    router.push({ pathname: '/matches/match-home', params: { matchId, groupId, isAdmin: isAdmin ? '1' : '0' } } as any);
  }, [groupId, router]);

  return {
    blockedCount,
    data: groupQuery.data,
    error: groupQuery.error,
    favoriteSpotAthletes: favoriteQuery.data ?? [],
    goCreateMatch,
    goEditGroup,
    goFinance,
    goInviteAthlete,
    goMatch,
    goMatches,
    goMembers,
    groupId,
    isError: groupQuery.isError,
    isLoading: groupQuery.isLoading,
    nextMatch,
    refetch: groupQuery.refetch,
    reviewPaymentsCount,
    router,
  };
}
