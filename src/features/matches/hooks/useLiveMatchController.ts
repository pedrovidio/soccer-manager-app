import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { liveMatchApi } from '../services/liveMatchApi';
import type { LiveMatchTeam } from '../types';
import { useMatchRealtimeSubscription } from './useMatchRealtimeSubscription';

type AddGoalInput = {
  athleteId: string;
  teamType: LiveMatchTeam;
};

export function useLiveMatchController(matchId: string) {
  const queryClient = useQueryClient();
  useMatchRealtimeSubscription(matchId);

  const matchQuery = useQuery({
    queryKey: ['live-match', matchId],
    queryFn: () => liveMatchApi.getLive(matchId),
    enabled: !!matchId,
  });

  const refreshMatch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['live-match', matchId] });
    queryClient.invalidateQueries({ queryKey: ['match-detail', matchId] });
  }, [matchId, queryClient]);

  const startMutation = useMutation({
    mutationFn: () => liveMatchApi.start(matchId),
    onSuccess: refreshMatch,
    onError: () => Alert.alert('Erro', 'Nao foi possivel iniciar a partida ao vivo.'),
  });

  const eventMutation = useMutation({
    mutationFn: ({ athleteId, teamType }: AddGoalInput) => liveMatchApi.registerEvent(matchId, {
      type: 'GOAL',
      teamType,
      athleteId,
      minute: elapsedMinute(matchQuery.data?.startedAt),
    }),
    onSuccess: refreshMatch,
    onError: () => Alert.alert('Erro', 'Nao foi possivel registrar o gol.'),
  });

  const finishMutation = useMutation({
    mutationFn: () => liveMatchApi.finish(matchId),
    onSuccess: refreshMatch,
    onError: () => Alert.alert('Erro', 'Nao foi possivel encerrar a partida.'),
  });

  return {
    match: matchQuery.data,
    isLoading: matchQuery.isLoading,
    isError: matchQuery.isError,
    isSubmitting: startMutation.isPending || eventMutation.isPending || finishMutation.isPending,
    refetch: matchQuery.refetch,
    startMatch: () => startMutation.mutate(),
    addGoal: (athleteId: string, teamType: LiveMatchTeam) => eventMutation.mutate({ athleteId, teamType }),
    finishMatch: () => finishMutation.mutate(),
  };
}

function elapsedMinute(startedAt: string | null | undefined) {
  if (!startedAt) return 0;
  return Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 60000));
}
