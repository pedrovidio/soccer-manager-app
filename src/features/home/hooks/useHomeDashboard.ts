import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { athleteApi } from '@features/athletes/services/athleteApi';
import { useAuthStore } from '@features/auth/useAuthStore';
import { queryKeys } from '@lib/queryKeys';
import { AthleteDashboard, ConfirmedMatch, Invite } from '@features/athletes/athleteTypes';
import { Notification } from '@features/notifications/types';

interface HomeDashboardResult {
  dashboard: AthleteDashboard | undefined;
  notifications: Notification[];
  invites: Invite[];
  confirmedMatches: ConfirmedMatch[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

export function useHomeDashboard(athleteId: string): HomeDashboardResult {
  const queryClient = useQueryClient();
  const setPlan = useAuthStore((state) => state.setPlan);
  const homeQuery = useQuery({
    queryKey: queryKeys.home(athleteId),
    queryFn: () => athleteApi.home(athleteId),
    enabled: !!athleteId,
    staleTime: 60_000,
  });

  useEffect(() => {
    const home = homeQuery.data;
    if (!home || !athleteId) return;

    queryClient.setQueryData(queryKeys.dashboard(athleteId), home.dashboard);
    queryClient.setQueryData(queryKeys.notifications(athleteId), home.notifications);
    queryClient.setQueryData(queryKeys.invites(athleteId), home.invites);

    if (home.dashboard.plan) {
      setPlan(home.dashboard.plan, home.dashboard.planExpiresAt ?? null);
    }
  }, [athleteId, homeQuery.data, queryClient, setPlan]);

  const isLoading = homeQuery.isLoading;
  const isError   = homeQuery.isError;

  function refetch() {
    homeQuery.refetch();
  }

  return {
    dashboard:        homeQuery.data?.dashboard,
    notifications:    homeQuery.data?.notifications ?? [],
    invites:          homeQuery.data?.invites ?? [],
    confirmedMatches: homeQuery.data?.dashboard.confirmedMatches ?? [],
    isLoading,
    isError,
    refetch,
  };
}
