import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { queryKeys } from '../../../lib/queryKeys';
import { realtime } from '../../../lib/realtime';
import { athleteApi } from '../../athletes/services/athleteApi';
import { useAthleteLocationSync } from '../../athletes/hooks/useAthleteLocationSync';
import { financialBlockMessage, hasFinancialBlock } from '../../athletes/utils/financialAccess';
import type { Invite } from '../../athletes/athleteTypes';
import { useAuthStore } from '../../auth/useAuthStore';
import { useHomeDashboard } from '../../home/hooks/useHomeDashboard';
import { matchApi } from '../../matchmaking/services/matchApi';
import { MarketplaceListItem, MarketplaceTab } from '../components/types';

export function useMarketplaceScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const athleteId = useAuthStore((state) => state.athleteId) ?? '';
  const { dashboard } = useHomeDashboard(athleteId);
  const blockedByDebt = hasFinancialBlock(dashboard);
  const blockMessage = financialBlockMessage(dashboard);
  const [tab, setTab] = useState<MarketplaceTab>('invites');

  const { isSyncingLocation, locationSyncError } = useAthleteLocationSync(
    athleteId,
    !!athleteId && !blockedByDebt,
  );

  const invitesQuery = useQuery({
    queryKey: queryKeys.invites(athleteId),
    queryFn: () => athleteApi.invites(athleteId),
    enabled: !!athleteId,
    refetchInterval: realtime.notificationsMs,
  });

  const spotMatchesQuery = useQuery({
    queryKey: queryKeys.marketplace(athleteId),
    queryFn: () => matchApi.listMarketplaceSpotMatches(),
    enabled: !!athleteId && !blockedByDebt,
    refetchInterval: realtime.discoveryMs,
  });

  const opportunities = useMemo(() => (
    (invitesQuery.data ?? []).filter((invite) => (
      invite.type === 'MATCH' && (invite.inviteType === 'SPOT' || !invite.inviteType)
    ))
  ), [invitesQuery.data]);

  const spotMatches = spotMatchesQuery.data ?? [];

  const respondMutation = useMutation({
    mutationFn: ({ invite, accept }: { invite: Invite; accept: boolean }) =>
      matchApi.respondInvite(invite.id, athleteId, accept),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invites(athleteId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(athleteId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.marketplace(athleteId) });

      if (variables.accept && variables.invite.matchId) {
        router.push({
          pathname: '/match-home',
          params: { matchId: variables.invite.matchId, groupId: '', isAdmin: '0' },
        } as any);
      }
    },
    onError: (error: any) => {
      Alert.alert('Erro', error?.response?.data?.error ?? 'Nao foi possivel responder a vaga.');
    },
  });

  const applyMutation = useMutation({
    mutationFn: (matchId: string) => matchApi.applyToSpotMatch(matchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.marketplace(athleteId) });
      Alert.alert('Candidatura enviada', 'O administrador foi avisado para aprovar ou recusar sua entrada.');
    },
    onError: (error: any) => {
      Alert.alert('Erro', error?.response?.data?.error ?? 'Nao foi possivel enviar sua candidatura.');
    },
  });

  const isLoading = tab === 'invites' ? invitesQuery.isLoading : spotMatchesQuery.isLoading;
  const isError = tab === 'invites' ? invitesQuery.isError : spotMatchesQuery.isError;

  const refetch = useCallback(() => {
    invitesQuery.refetch();
    spotMatchesQuery.refetch();
  }, [invitesQuery, spotMatchesQuery]);

  const goFinance = useCallback(() => {
    router.push('/athlete-finance' as any);
  }, [router]);

  const acceptInvite = useCallback((invite: Invite) => {
    respondMutation.mutate({ invite, accept: true });
  }, [respondMutation]);

  const declineInvite = useCallback((invite: Invite) => {
    respondMutation.mutate({ invite, accept: false });
  }, [respondMutation]);

  const applyToMatch = useCallback((matchId: string) => {
    applyMutation.mutate(matchId);
  }, [applyMutation]);

  const listData = useMemo<MarketplaceListItem[]>(() => {
    if (blockedByDebt) return [{ type: 'debt-lock' }];
    if (tab === 'search' && locationSyncError) return [{ type: 'location-warning' }];
    if (isError) return [{ type: 'error' }];

    if (tab === 'invites') {
      if (opportunities.length === 0) {
        return [{ type: 'empty', icon: 'mail-open-outline', text: 'Nenhum convite avulso recebido agora.' }];
      }

      return opportunities.map((invite) => ({ type: 'invite', invite }));
    }

    if (spotMatches.length === 0) {
      return [{
        type: 'empty',
        icon: 'football-outline',
        text: 'Nenhum jogo aberto dentro dos seus critérios. Confira sua localização, disponibilidade e tente novamente.',
      }];
    }

    return spotMatches.map((match) => ({ type: 'spot-match', match }));
  }, [blockedByDebt, isError, locationSyncError, opportunities, spotMatches, tab]);

  return {
    tab,
    setTab,
    isLoading,
    isSyncingLocation,
    listData,
    blockMessage,
    inviteCount: opportunities.length,
    matchCount: spotMatches.length,
    respondMutation,
    applyMutation,
    refetch,
    goFinance,
    acceptInvite,
    declineInvite,
    applyToMatch,
  };
}
