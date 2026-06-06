import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@lib/supabase';
import { queryKeys } from '@lib/queryKeys';

export function useMatchRealtime(athleteId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!athleteId) return;

    const invalidateMatches = () => {
      queryClient.invalidateQueries({ queryKey: ['match-detail'] });
      queryClient.invalidateQueries({ queryKey: ['group-home'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.home(athleteId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(athleteId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.marketplace(athleteId) });
    };

    const channel = supabase
      .channel(`match-realtime:${athleteId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, invalidateMatches)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'match_invites' }, () => {
        invalidateMatches();
        queryClient.invalidateQueries({ queryKey: queryKeys.home(athleteId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.invites(athleteId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications(athleteId) });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'spot_applications' }, () => {
        invalidateMatches();
        queryClient.invalidateQueries({ queryKey: ['spot-applications'] });
        queryClient.invalidateQueries({ queryKey: ['nearby-athletes-all'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [athleteId, queryClient]);
}
