import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@lib/supabase';
import { queryKeys } from '@lib/queryKeys';
import { useBatchedQueryInvalidation } from './useBatchedQueryInvalidation';

export function useGroupRealtime(athleteId: string | null) {
  const queryClient = useQueryClient();
  const scheduleInvalidations = useBatchedQueryInvalidation(queryClient);

  useEffect(() => {
    if (!athleteId) return;

    const invalidateGroups = () => {
      scheduleInvalidations([
        queryKeys.groups(athleteId),
        queryKeys.favoriteGroups(),
        queryKeys.groupHomes(),
        queryKeys.favoriteSpotAthletesAll(),
        queryKeys.home(athleteId),
        queryKeys.dashboard(athleteId),
      ]);
    };

    const channel = supabase
      .channel(`group-realtime:${athleteId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'groups' }, invalidateGroups)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_invites' }, () => {
        invalidateGroups();
        scheduleInvalidations([
          queryKeys.home(athleteId),
          queryKeys.invites(athleteId),
          queryKeys.notifications(athleteId),
        ]);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_member_statuses' }, invalidateGroups)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_favorite_spot_athletes' }, invalidateGroups)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [athleteId, scheduleInvalidations]);
}
