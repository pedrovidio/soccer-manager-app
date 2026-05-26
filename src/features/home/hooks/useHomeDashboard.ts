import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  const setPlan = useAuthStore((state) => state.setPlan);
  const dashboardQuery = useQuery({
    queryKey: queryKeys.dashboard(athleteId),
    queryFn: () => athleteApi.dashboard(athleteId),
    enabled: !!athleteId,
  });

  useEffect(() => {
    if (!dashboardQuery.data?.plan) return;
    setPlan(dashboardQuery.data.plan, dashboardQuery.data.planExpiresAt ?? null);
  }, [dashboardQuery.data?.plan, dashboardQuery.data?.planExpiresAt, setPlan]);

  const notificationsQuery = useQuery({
    queryKey: queryKeys.notifications(athleteId),
    queryFn: () => athleteApi.notifications(athleteId),
    enabled: !!athleteId,
  });

  const invitesQuery = useQuery({
    queryKey: queryKeys.invites(athleteId),
    queryFn: () => athleteApi.invites(athleteId),
    enabled: !!athleteId,
  });

  const isLoading = dashboardQuery.isLoading || notificationsQuery.isLoading || invitesQuery.isLoading;
  const isError   = dashboardQuery.isError   || notificationsQuery.isError   || invitesQuery.isError;

  function refetch() {
    dashboardQuery.refetch();
    notificationsQuery.refetch();
    invitesQuery.refetch();
  }

  return {
    dashboard:        dashboardQuery.data,
    notifications:    notificationsQuery.data ?? [],
    invites:          invitesQuery.data ?? [],
    confirmedMatches: dashboardQuery.data?.confirmedMatches ?? [],
    isLoading,
    isError,
    refetch,
  };
}
