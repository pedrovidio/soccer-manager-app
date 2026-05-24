import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@lib/supabase';
import { queryKeys } from '@lib/queryKeys';

export function useNotificationsRealtime(athleteId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!athleteId) return;

    const channel = supabase
      .channel(`notifications-realtime:${athleteId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `athlete_id=eq.${athleteId}` },
        () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications(athleteId) }),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [athleteId, queryClient]);
}
