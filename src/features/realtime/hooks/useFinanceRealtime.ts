import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@lib/supabase';
import { queryKeys } from '@lib/queryKeys';

export function useFinanceRealtime(athleteId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!athleteId) return;

    const channel = supabase
      .channel(`finance-realtime:${athleteId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'financial_transactions' }, () => {
        queryClient.invalidateQueries({ queryKey: ['group-finance-report'] });
        queryClient.invalidateQueries({ queryKey: ['athlete-finance-report'] });
        queryClient.invalidateQueries({ queryKey: ['group-home'] });
        queryClient.invalidateQueries({ queryKey: queryKeys.home(athleteId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(athleteId) });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [athleteId, queryClient]);
}
