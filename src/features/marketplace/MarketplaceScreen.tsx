import React, { useState } from 'react';
import {
  ActivityIndicator, Alert, RefreshControl, SafeAreaView, ScrollView,
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { queryKeys } from '../../lib/queryKeys';
import { realtime } from '../../lib/realtime';
import { useAuthStore } from '../auth/useAuthStore';
import { BottomNav } from '../common/components/BottomNav';
import { Colors, Radius, Spacing } from '../common/theme';
import { athleteApi } from '../athletes/services/athleteApi';
import { matchApi } from '../matchmaking/services/matchApi';
import { useHomeDashboard } from '../home/hooks/useHomeDashboard';
import { useAthleteLocationSync } from '../athletes/hooks/useAthleteLocationSync';
import { financialBlockMessage, hasFinancialBlock } from '../athletes/utils/financialAccess';
import type { Invite } from '../athletes/athleteTypes';
import type { SpotMarketplaceMatch } from '../matchmaking/types';

type Tab = 'invites' | 'search';

function formatDate(value?: string) {
  if (!value) return 'Data a confirmar';
  const date = new Date(value);
  return `${date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })} as ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function MarketplaceScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const athleteId = useAuthStore((s) => s.athleteId) ?? '';
  const { dashboard } = useHomeDashboard(athleteId);
  const blockedByDebt = hasFinancialBlock(dashboard);
  const { isSyncingLocation, locationSyncError } = useAthleteLocationSync(athleteId, !!athleteId && !blockedByDebt);
  const [tab, setTab] = useState<Tab>('invites');

  const { data: invites = [], isLoading: invitesLoading, isError: invitesError, refetch: refetchInvites } = useQuery({
    queryKey: queryKeys.invites(athleteId),
    queryFn: () => athleteApi.invites(athleteId),
    enabled: !!athleteId,
    refetchInterval: realtime.notificationsMs,
  });

  const {
    data: spotMatches = [],
    isLoading: matchesLoading,
    isError: matchesError,
    refetch: refetchMatches,
  } = useQuery({
    queryKey: queryKeys.marketplace(athleteId),
    queryFn: () => matchApi.listMarketplaceSpotMatches(),
    enabled: !!athleteId && !blockedByDebt,
    refetchInterval: realtime.discoveryMs,
  });

  const respondMutation = useMutation({
    mutationFn: ({ invite, accept }: { invite: Invite; accept: boolean }) =>
      matchApi.respondInvite(invite.id, athleteId, accept),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.invites(athleteId) });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard(athleteId) });
      qc.invalidateQueries({ queryKey: queryKeys.marketplace(athleteId) });
      if (variables.accept && variables.invite.matchId) {
        router.push({ pathname: '/match-home', params: { matchId: variables.invite.matchId, groupId: '', isAdmin: '0' } } as any);
      }
    },
    onError: (error: any) => {
      Alert.alert('Erro', error?.response?.data?.error ?? 'Nao foi possivel responder a vaga.');
    },
  });

  const applyMutation = useMutation({
    mutationFn: (matchId: string) => matchApi.applyToSpotMatch(matchId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.marketplace(athleteId) });
      Alert.alert('Candidatura enviada', 'O administrador foi avisado para aprovar ou recusar sua entrada.');
    },
    onError: (error: any) => {
      Alert.alert('Erro', error?.response?.data?.error ?? 'Nao foi possivel enviar sua candidatura.');
    },
  });

  const opportunities = invites.filter((invite) =>
    invite.type === 'MATCH' && (invite.inviteType === 'SPOT' || !invite.inviteType),
  );
  const isLoading = tab === 'invites' ? invitesLoading : matchesLoading;
  const isError = tab === 'invites' ? invitesError : matchesError;

  function refetch() {
    refetchInvites();
    refetchMatches();
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Buscar jogos</Text>
          <Text style={s.headerSub}>{tab === 'invites' ? 'Convites recebidos' : 'Partidas perto de você'}</Text>
        </View>
        {isSyncingLocation && <ActivityIndicator color={Colors.primary} />}
      </View>

      <View style={s.tabs}>
        <TabButton label={`Convites (${opportunities.length})`} active={tab === 'invites'} onPress={() => setTab('invites')} />
        <TabButton label={`Buscar jogos (${spotMatches.length})`} active={tab === 'search'} onPress={() => setTab('search')} />
      </View>

      <ScrollView
        contentContainerStyle={s.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} colors={[Colors.primary]} />}
      >
        {blockedByDebt && (
          <View style={s.lockCard}>
            <Ionicons name="lock-closed-outline" size={24} color={Colors.errorDark} />
            <View style={{ flex: 1 }}>
              <Text style={s.lockTitle}>Marketplace bloqueado</Text>
              <Text style={s.lockText}>{financialBlockMessage(dashboard)}</Text>
            </View>
            <TouchableOpacity style={s.financeBtn} onPress={() => router.push('/athlete-finance' as any)}>
              <Text style={s.financeBtnText}>Ver</Text>
            </TouchableOpacity>
          </View>
        )}

        {!blockedByDebt && tab === 'search' && locationSyncError && (
          <View style={s.infoCard}>
            <Ionicons name="location-outline" size={24} color={Colors.warningDark} />
            <Text style={s.infoTitle}>Localização necessária</Text>
            <Text style={s.infoText}>Habilite a localização para buscar partidas abertas perto de você.</Text>
          </View>
        )}

        {!blockedByDebt && isError && (
          <EmptyState icon="alert-circle-outline" text="Erro ao carregar vagas" tone="error" />
        )}

        {!blockedByDebt && !isError && tab === 'invites' && opportunities.length === 0 && (
          <EmptyState icon="mail-open-outline" text="Nenhum convite avulso recebido agora." />
        )}

        {!blockedByDebt && !isError && tab === 'search' && spotMatches.length === 0 && (
          <EmptyState icon="football-outline" text="Nenhum jogo aberto dentro dos seus critérios. Confira sua localização, disponibilidade e tente novamente." />
        )}

        {!blockedByDebt && tab === 'invites' && opportunities.map((invite) => (
          <InviteCard
            key={invite.id}
            invite={invite}
            isPending={respondMutation.isPending && respondMutation.variables?.invite.id === invite.id}
            onAccept={() => respondMutation.mutate({ invite, accept: true })}
            onDecline={() => respondMutation.mutate({ invite, accept: false })}
          />
        ))}

        {!blockedByDebt && tab === 'search' && spotMatches.map((match) => (
          <SpotMatchCard
            key={match.id}
            match={match}
            isPending={applyMutation.isPending && applyMutation.variables === match.id}
            onApply={() => applyMutation.mutate(match.id)}
          />
        ))}
      </ScrollView>

      <BottomNav active="marketplace" />
    </SafeAreaView>
  );
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[s.tabBtn, active && s.tabBtnActive]} onPress={onPress} activeOpacity={0.7}>
      <Text style={[s.tabText, active && s.tabTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function InviteCard({
  invite, isPending, onAccept, onDecline,
}: {
  invite: Invite;
  isPending: boolean;
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <View style={s.card}>
      <View style={s.cardTop}>
        <View style={s.iconBox}><Ionicons name="mail-outline" size={20} color={Colors.primary} /></View>
        <View style={{ flex: 1 }}>
          <Text style={s.cardTitle} numberOfLines={1}>{invite.matchGroupName ?? 'Grupo'}</Text>
          <Text style={s.cardSub} numberOfLines={1}>{invite.matchLocation ?? 'Local a confirmar'}</Text>
        </View>
      </View>
      <InfoLine icon="calendar-outline" text={formatDate(invite.matchDate)} />
      <View style={s.actions}>
        <TouchableOpacity style={s.secondaryBtn} onPress={onDecline} disabled={isPending}>
          <Text style={s.secondaryBtnText}>Recusar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.primaryBtn, isPending && { opacity: 0.6 }]} onPress={onAccept} disabled={isPending}>
          {isPending ? <ActivityIndicator color={Colors.white} size="small" /> : <Text style={s.primaryBtnText}>Aceitar vaga</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function SpotMatchCard({ match, isPending, onApply }: { match: SpotMarketplaceMatch; isPending: boolean; onApply: () => void }) {
  const waiting = match.applicationStatus === 'PENDING';
  return (
    <View style={s.card}>
      <View style={s.cardTop}>
        <View style={s.iconBox}><Ionicons name="football-outline" size={20} color={Colors.primary} /></View>
        <View style={{ flex: 1 }}>
          <Text style={s.cardTitle} numberOfLines={1}>{match.groupName}</Text>
          <Text style={s.cardSub} numberOfLines={1}>{match.location}</Text>
        </View>
      </View>
      <InfoLine icon="calendar-outline" text={formatDate(match.date)} />
      <InfoLine icon="navigate-outline" text={`${match.distanceKm} km de distância`} />
      <InfoLine icon="people-outline" text={`${match.vacanciesLeft} vaga(s) aberta(s) de ${match.totalVacancies}`} />
      <Text style={s.criteria}>
        {match.type} · OVR mínimo {match.minOverall} · {match.minAge}-{match.maxAge} anos · {formatCurrency(match.spotFee)}
      </Text>
      <TouchableOpacity
        style={[s.primaryBtn, (isPending || waiting) && { opacity: 0.65 }]}
        onPress={onApply}
        disabled={isPending || waiting}
      >
        {isPending ? (
          <ActivityIndicator color={Colors.white} size="small" />
        ) : (
          <Text style={s.primaryBtnText}>{waiting ? 'Aguardando aprovação' : 'Candidatar-se'}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

function InfoLine({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={s.infoRow}>
      <Ionicons name={icon} size={15} color={Colors.n500} />
      <Text style={s.infoLineText}>{text}</Text>
    </View>
  );
}

function EmptyState({ icon, text, tone = 'neutral' }: { icon: keyof typeof Ionicons.glyphMap; text: string; tone?: 'neutral' | 'error' }) {
  const color = tone === 'error' ? Colors.error : Colors.n300;
  return (
    <View style={s.emptyCard}>
      <Ionicons name={icon} size={34} color={color} />
      <Text style={s.emptyText}>{text}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.n50 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.n200 },
  headerTitle: { fontSize: 18, fontWeight: '900', color: Colors.n900 },
  headerSub: { fontSize: 12, color: Colors.n500, marginTop: 2 },
  tabs: { flexDirection: 'row', gap: 8, padding: Spacing.lg, backgroundColor: Colors.white },
  tabBtn: { flex: 1, borderRadius: Radius.r8, backgroundColor: Colors.n100, alignItems: 'center', paddingVertical: 10 },
  tabBtnActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: 12, fontWeight: '900', color: Colors.n600 },
  tabTextActive: { color: Colors.white },
  content: { padding: Spacing.lg, gap: 12 },
  lockCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.errorLight, borderRadius: Radius.r12, borderWidth: 1, borderColor: Colors.error, padding: Spacing.md },
  lockTitle: { fontSize: 14, fontWeight: '900', color: Colors.errorDark },
  lockText: { fontSize: 12, color: Colors.errorDark, marginTop: 2, lineHeight: 16 },
  financeBtn: { backgroundColor: Colors.white, borderRadius: Radius.r8, paddingHorizontal: 12, paddingVertical: 8 },
  financeBtnText: { color: Colors.errorDark, fontWeight: '900', fontSize: 12 },
  infoCard: { alignItems: 'center', backgroundColor: Colors.warningLight, borderRadius: Radius.r12, borderWidth: 1, borderColor: Colors.warning, padding: Spacing.lg, gap: 6 },
  infoTitle: { fontSize: 14, fontWeight: '900', color: Colors.warningDark },
  infoText: { fontSize: 12, color: Colors.warningDark, textAlign: 'center' },
  emptyCard: { alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.r12, borderWidth: 1, borderColor: Colors.n200, paddingVertical: 34, gap: 8 },
  emptyText: { fontSize: 13, color: Colors.n500, fontWeight: '700', textAlign: 'center' },
  card: { backgroundColor: Colors.white, borderRadius: Radius.r12, borderWidth: 1, borderColor: Colors.n200, padding: Spacing.md, gap: 12 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBox: { width: 38, height: 38, borderRadius: Radius.r8, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '900', color: Colors.n900 },
  cardSub: { fontSize: 12, color: Colors.n500, marginTop: 2 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoLineText: { fontSize: 12, fontWeight: '700', color: Colors.n700 },
  criteria: { fontSize: 11, fontWeight: '700', color: Colors.n500 },
  actions: { flexDirection: 'row', gap: 10 },
  secondaryBtn: { flex: 1, alignItems: 'center', borderRadius: Radius.r8, backgroundColor: Colors.n100, paddingVertical: 11 },
  secondaryBtnText: { color: Colors.n700, fontWeight: '900' },
  primaryBtn: { alignItems: 'center', borderRadius: Radius.r8, backgroundColor: Colors.primary, paddingVertical: 11, paddingHorizontal: 12 },
  primaryBtnText: { color: Colors.white, fontWeight: '900' },
});
