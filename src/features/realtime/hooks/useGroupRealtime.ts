import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@lib/supabase';
import { queryKeys } from '@lib/queryKeys';

export function useGroupRealtime(athleteId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!athleteId) return;

    const invalidateGroups = () => {
      queryClient.invalidateQueries({ queryKey: ['groups', athleteId] });
      queryClient.invalidateQueries({ queryKey: ['group'] });
      queryClient.invalidateQueries({ queryKey: ['group-home'] });
      queryClient.invalidateQueries({ queryKey: ['favorite-spot-athletes'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(athleteId) });
    };

    const channel = supabase
      .channel(`group-realtime:${athleteId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'groups' }, invalidateGroups)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_invites' }, () => {
        invalidateGroups();
        queryClient.invalidateQueries({ queryKey: queryKeys.invites(athleteId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications(athleteId) });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_member_statuses' }, invalidateGroups)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_favorite_spot_athletes' }, invalidateGroups)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [athleteId, queryClient]);
}
