import { useCallback, useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { realtime } from '../../../../lib/realtime';
import { useAuthStore } from '../../../auth/useAuthStore';
import { groupApi } from '../../services/groupApi';

export function useGroupHomeScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const router = useRouter();
  const athleteId = useAuthStore((state) => state.athleteId) ?? '';

  const groupQuery = useQuery({
    queryKey: ['group-home', groupId],
    queryFn: () => groupApi.getHome(groupId!, athleteId),
    enabled: !!groupId && !!athleteId,
    refetchInterval: realtime.sharedStateMs,
  });

  const favoriteQuery = useQuery({
    queryKey: ['favorite-spot-athletes', groupId],
    queryFn: () => groupApi.listFavoriteSpotAthletes(groupId!, athleteId),
    enabled: !!groupId && !!athleteId && groupQuery.data?.isAdmin === true,
    refetchInterval: realtime.sharedStateMs,
  });

  const financeQuery = useQuery({
    queryKey: ['group-finance-report', groupId, athleteId, 'home-review'],
    queryFn: () => groupApi.financeReport(groupId!, athleteId),
    enabled: !!groupId && !!athleteId && groupQuery.data?.isAdmin === true,
    refetchInterval: realtime.financeMs,
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

  const goEditGroup = useCallback(() => router.push({ pathname: '/edit-group', params: { groupId } } as any), [groupId, router]);
  const goInviteAthlete = useCallback((groupName: string) => router.push({ pathname: '/invite-athlete', params: { groupId, groupName } } as any), [groupId, router]);
  const goCreateMatch = useCallback(() => router.push({ pathname: '/create-match', params: { groupId } } as any), [groupId, router]);
  const goFinance = useCallback((tab?: string) => router.push({ pathname: '/group-finance', params: { groupId, ...(tab && { tab }) } } as any), [groupId, router]);
  const goMembers = useCallback((tab: string) => router.push({ pathname: '/group-members', params: { groupId, tab } } as any), [groupId, router]);
  const goMatches = useCallback(() => router.push({ pathname: '/group-matches', params: { groupId } } as any), [groupId, router]);
  const goMatch = useCallback((matchId: string, isAdmin: boolean) => {
    router.push({ pathname: '/match-home', params: { matchId, groupId, isAdmin: isAdmin ? '1' : '0' } } as any);
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
