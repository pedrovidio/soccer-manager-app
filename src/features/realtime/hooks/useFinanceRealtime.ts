import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@lib/supabase';
import { queryKeys } from '@lib/queryKeys';
import { useBatchedQueryInvalidation } from './useBatchedQueryInvalidation';

export function useFinanceRealtime(athleteId: string | null) {
  const queryClient = useQueryClient();
  const scheduleInvalidations = useBatchedQueryInvalidation(queryClient);

  useEffect(() => {
    if (!athleteId) return;

    const channel = supabase
      .channel(`finance-realtime:${athleteId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'financial_transactions' }, () => {
        scheduleInvalidations([
          queryKeys.groupFinanceReportsAll(),
          queryKeys.athleteFinanceReports(),
          queryKeys.groupHomes(),
          queryKeys.home(athleteId),
          queryKeys.dashboard(athleteId),
        ]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [athleteId, scheduleInvalidations]);
}
