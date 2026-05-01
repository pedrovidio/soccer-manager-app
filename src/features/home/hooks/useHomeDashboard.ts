import { useQuery } from '@tanstack/react-query';
import { athleteApi } from '../../athletes/services/athleteApi';
import { matchApi } from '../../matchmaking/services/matchApi';
import { queryKeys } from '../../../lib/queryKeys';
import { AthleteDashboard, Invite } from '../../athletes/athleteTypes';
import { Notification } from '../../notifications/types';
import { Match } from '../../matchmaking/types';

interface HomeDashboardResult {
  dashboard: AthleteDashboard | undefined;
  notifications: Notification[];
  invites: Invite[];
  groupMatches: Match[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

export function useHomeDashboard(athleteId: string): HomeDashboardResult {
  const dashboardQuery = useQuery({
    queryKey: queryKeys.dashboard(athleteId),
    queryFn: () => athleteApi.dashboard(athleteId),
    enabled: !!athleteId,
  });

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

  // Só dispara se o atleta pertencer a pelo menos um grupo
  const firstGroupId = dashboardQuery.data?.groupIds?.[0];

  const groupMatchesQuery = useQuery({
    queryKey: queryKeys.groupMatches(firstGroupId ?? ''),
    queryFn: () => matchApi.listByGroup(firstGroupId!),
    enabled: !!firstGroupId,
  });

  const isLoading =
    dashboardQuery.isLoading ||
    notificationsQuery.isLoading ||
    invitesQuery.isLoading;

  const isError =
    dashboardQuery.isError ||
    notificationsQuery.isError ||
    invitesQuery.isError;

  function refetch() {
    dashboardQuery.refetch();
    notificationsQuery.refetch();
    invitesQuery.refetch();
    if (firstGroupId) groupMatchesQuery.refetch();
  }

  return {
    dashboard: dashboardQuery.data,
    notifications: notificationsQuery.data ?? [],
    invites: invitesQuery.data ?? [],
    groupMatches: groupMatchesQuery.data ?? [],
    isLoading,
    isError,
    refetch,
  };
}
