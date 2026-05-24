import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@lib/supabase';

export function useMatchRealtimeSubscription(matchId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!matchId) return;

    const invalidateMatch = () => {
      queryClient.invalidateQueries({ queryKey: ['match-detail', matchId] });
      queryClient.invalidateQueries({ queryKey: ['live-match', matchId] });
    };

    const channel = supabase
      .channel(matchId)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_events',
          filter: `match_id=eq.${matchId}`,
        },
        invalidateMatch,
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'matches',
          filter: `id=eq.${matchId}`,
        },
        invalidateMatch,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, queryClient]);
}
