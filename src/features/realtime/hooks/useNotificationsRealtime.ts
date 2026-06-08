import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@lib/supabase';
import { queryKeys } from '@lib/queryKeys';
import { SupabaseRealtimePayload } from '@lib/supabase/types';
import { Notification } from '@features/notifications/types';
import { useBatchedQueryInvalidation } from './useBatchedQueryInvalidation';
import { applyNotificationRealtimeEvent, NotificationRealtimeRow } from './notificationRealtimeCache';

export function useNotificationsRealtime(athleteId: string | null) {
  const queryClient = useQueryClient();
  const scheduleInvalidations = useBatchedQueryInvalidation(queryClient);

  useEffect(() => {
    if (!athleteId) return;

    const channel = supabase
      .channel(`notifications-realtime:${athleteId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `athlete_id=eq.${athleteId}` },
        (payload: SupabaseRealtimePayload<NotificationRealtimeRow>) => {
          queryClient.setQueryData<Notification[]>(
            queryKeys.notifications(athleteId),
            (current) => applyNotificationRealtimeEvent(current ?? [], payload),
          );
          scheduleInvalidations([queryKeys.home(athleteId)]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [athleteId, scheduleInvalidations]);
}
