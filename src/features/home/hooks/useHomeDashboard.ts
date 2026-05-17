import { useQuery } from '@tanstack/react-query';
import { athleteApi } from '../../athletes/services/athleteApi';
import { queryKeys } from '../../../lib/queryKeys';
import { realtime } from '../../../lib/realtime';
import { AthleteDashboard, ConfirmedMatch, Invite } from '../../athletes/athleteTypes';
import { Notification } from '../../notifications/types';

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
  const dashboardQuery = useQuery({
    queryKey: queryKeys.dashboard(athleteId),
    queryFn: () => athleteApi.dashboard(athleteId),
    enabled: !!athleteId,
    refetchInterval: realtime.sharedStateMs,
  });

  const notificationsQuery = useQuery({
    queryKey: queryKeys.notifications(athleteId),
    queryFn: () => athleteApi.notifications(athleteId),
    enabled: !!athleteId,
    refetchInterval: realtime.notificationsMs,
  });

  const invitesQuery = useQuery({
    queryKey: queryKeys.invites(athleteId),
    queryFn: () => athleteApi.invites(athleteId),
    enabled: !!athleteId,
    refetchInterval: realtime.notificationsMs,
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
