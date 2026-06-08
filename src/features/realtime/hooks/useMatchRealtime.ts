import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@lib/supabase';
import { queryKeys } from '@lib/queryKeys';
import { useBatchedQueryInvalidation } from './useBatchedQueryInvalidation';

export function useMatchRealtime(athleteId: string | null) {
  const queryClient = useQueryClient();
  const scheduleInvalidations = useBatchedQueryInvalidation(queryClient);

  useEffect(() => {
    if (!athleteId) return;

    const invalidateMatches = () => {
      scheduleInvalidations([
        ['match-detail'],
        queryKeys.groupHomes(),
        queryKeys.home(athleteId),
        queryKeys.dashboard(athleteId),
        queryKeys.marketplace(athleteId),
      ]);
    };

    const channel = supabase
      .channel(`match-realtime:${athleteId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, invalidateMatches)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'match_invites' }, () => {
        invalidateMatches();
        scheduleInvalidations([
          queryKeys.home(athleteId),
          queryKeys.invites(athleteId),
          queryKeys.notifications(athleteId),
        ]);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'spot_applications' }, () => {
        invalidateMatches();
        scheduleInvalidations([
          ['spot-applications'],
          ['nearby-athletes-all'],
        ]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [athleteId, scheduleInvalidations]);
}
