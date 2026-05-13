import React from 'react';
import {
  ActivityIndicator, Alert, RefreshControl, SafeAreaView, ScrollView,
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { queryKeys } from '../../lib/queryKeys';
import { useAuthStore } from '../auth/useAuthStore';
import { BottomNav } from '../common/components/BottomNav';
import { Colors, Radius, Spacing } from '../common/theme';
import { athleteApi } from '../athletes/services/athleteApi';
import { matchApi } from '../matchmaking/services/matchApi';
import { useHomeDashboard } from '../home/hooks/useHomeDashboard';
import { useAthleteLocationSync } from '../athletes/hooks/useAthleteLocationSync';
import { financialBlockMessage, hasFinancialBlock } from '../athletes/utils/financialAccess';
import type { Invite } from '../athletes/athleteTypes';

function formatDate(value?: string) {
  if (!value) return 'Data a confirmar';
  const date = new Date(value);
  return `${date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })} as ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
}

export default function MarketplaceScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const athleteId = useAuthStore((s) => s.athleteId) ?? '';
  const { dashboard } = useHomeDashboard(athleteId);
  const blockedByDebt = hasFinancialBlock(dashboard);
  const { isSyncingLocation } = useAthleteLocationSync(athleteId, !!athleteId && !blockedByDebt);

  const { data: invites = [], isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.invites(athleteId),
    queryFn: () => athleteApi.invites(athleteId),
    enabled: !!athleteId,
  });

  const respondMutation = useMutation({
    mutationFn: ({ invite, accept }: { invite: Invite; accept: boolean }) =>
      matchApi.respondInvite(invite.id, athleteId, accept),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.invites(athleteId) });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard(athleteId) });
      if (variables.accept && variables.invite.matchId) {
        router.push({ pathname: '/match-home', params: { matchId: variables.invite.matchId, groupId: '', isAdmin: '0' } } as any);
      }
    },
    onError: (error: any) => {
      Alert.alert('Erro', error?.response?.data?.error ?? 'Nao foi possivel responder a vaga.');
    },
  });

  const opportunities = invites.filter((invite) =>
    invite.type === 'MATCH' && (invite.inviteType === 'SPOT' || !invite.inviteType),
  );

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Vagas avulsas</Text>
          <Text style={s.headerSub}>Convites abertos perto de voce</Text>
        </View>
        {isSyncingLocation && <ActivityIndicator color={Colors.primary} />}
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

        {!blockedByDebt && isError && (
          <View style={s.emptyCard}>
            <Ionicons name="alert-circle-outline" size={34} color={Colors.error} />
            <Text style={s.emptyText}>Erro ao carregar vagas</Text>
          </View>
        )}

        {!blockedByDebt && !isError && opportunities.length === 0 && (
          <View style={s.emptyCard}>
            <Ionicons name="football-outline" size={34} color={Colors.n300} />
            <Text style={s.emptyText}>Nenhuma vaga avulsa disponivel agora</Text>
          </View>
        )}

        {!blockedByDebt && opportunities.map((invite) => (
          <OpportunityCard
            key={invite.id}
            invite={invite}
            isPending={respondMutation.isPending && respondMutation.variables?.invite.id === invite.id}
            onAccept={() => respondMutation.mutate({ invite, accept: true })}
            onDecline={() => respondMutation.mutate({ invite, accept: false })}
          />
        ))}
      </ScrollView>

      <BottomNav active="marketplace" />
    </SafeAreaView>
  );
}

function OpportunityCard({
  invite, isPending, onAccept, onDecline,
}: {
  invite: Invite;
  isPending: boolean;
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <View style={s.card}>
      <View>
        <View style={s.cardTop}>
          <View style={s.iconBox}>
            <Ionicons name="football-outline" size={20} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.cardTitle} numberOfLines={1}>{invite.matchGroupName ?? 'Grupo'}</Text>
            <Text style={s.cardSub} numberOfLines={1}>{invite.matchLocation ?? 'Local a confirmar'}</Text>
          </View>
        </View>
        <View style={s.infoRow}>
          <Ionicons name="calendar-outline" size={15} color={Colors.n500} />
          <Text style={s.infoText}>{formatDate(invite.matchDate)}</Text>
        </View>
      </View>
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

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.n50 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.n200 },
  headerTitle: { fontSize: 18, fontWeight: '900', color: Colors.n900 },
  headerSub: { fontSize: 12, color: Colors.n500, marginTop: 2 },
  content: { padding: Spacing.lg, gap: 12 },
  lockCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.errorLight, borderRadius: Radius.r12, borderWidth: 1, borderColor: Colors.error, padding: Spacing.md },
  lockTitle: { fontSize: 14, fontWeight: '900', color: Colors.errorDark },
  lockText: { fontSize: 12, color: Colors.errorDark, marginTop: 2, lineHeight: 16 },
  financeBtn: { backgroundColor: Colors.white, borderRadius: Radius.r8, paddingHorizontal: 12, paddingVertical: 8 },
  financeBtnText: { color: Colors.errorDark, fontWeight: '900', fontSize: 12 },
  emptyCard: { alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.r12, borderWidth: 1, borderColor: Colors.n200, paddingVertical: 34, gap: 8 },
  emptyText: { fontSize: 13, color: Colors.n500, fontWeight: '700' },
  card: { backgroundColor: Colors.white, borderRadius: Radius.r12, borderWidth: 1, borderColor: Colors.n200, padding: Spacing.md, gap: 12 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBox: { width: 38, height: 38, borderRadius: Radius.r8, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '900', color: Colors.n900 },
  cardSub: { fontSize: 12, color: Colors.n500, marginTop: 2 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  infoText: { fontSize: 12, fontWeight: '700', color: Colors.n700 },
  actions: { flexDirection: 'row', gap: 10 },
  secondaryBtn: { flex: 1, alignItems: 'center', borderRadius: Radius.r8, backgroundColor: Colors.n100, paddingVertical: 11 },
  secondaryBtnText: { color: Colors.n700, fontWeight: '900' },
  primaryBtn: { flex: 1, alignItems: 'center', borderRadius: Radius.r8, backgroundColor: Colors.primary, paddingVertical: 11 },
  primaryBtnText: { color: Colors.white, fontWeight: '900' },
});
