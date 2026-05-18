import React from 'react';
import {
  ActivityIndicator, RefreshControl, SafeAreaView, ScrollView,
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { BackButton } from '../../common/components/BackButton';
import { Colors, Radius, Spacing } from '../../common/theme';
import { realtime } from '../../../lib/realtime';
import { useAuthStore } from '../../auth/useAuthStore';
import { groupApi } from '../services/groupApi';
import { GroupUpcomingMatch } from '../groupTypes';
import { GroupTopMenu } from './GroupTopMenu';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function GroupHomeScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const router = useRouter();
  const athleteId = useAuthStore((s) => s.athleteId) ?? '';

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['group-home', groupId],
    queryFn: () => groupApi.getHome(groupId!, athleteId),
    enabled: !!groupId && !!athleteId,
    refetchInterval: realtime.sharedStateMs,
  });

  const { data: favoriteSpotAthletes = [] } = useQuery({
    queryKey: ['favorite-spot-athletes', groupId],
    queryFn: () => groupApi.listFavoriteSpotAthletes(groupId!, athleteId),
    enabled: !!groupId && !!athleteId && data?.isAdmin === true,
    refetchInterval: realtime.sharedStateMs,
  });

  const { data: financeReport } = useQuery({
    queryKey: ['group-finance-report', groupId, athleteId, 'home-review'],
    queryFn: () => groupApi.financeReport(groupId!, athleteId),
    enabled: !!groupId && !!athleteId && data?.isAdmin === true,
    refetchInterval: realtime.financeMs,
  });

  if (isLoading) {
    return (
      <SafeAreaView style={[s.safe, s.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (isError || !data) {
    const isForbidden = (error as any)?.response?.status === 403;
    return (
      <SafeAreaView style={[s.safe, s.center]}>
        <Ionicons name="alert-circle-outline" size={40} color={Colors.error} />
        <Text style={s.errorText}>{isForbidden ? 'Você não tem acesso a este grupo' : 'Erro ao carregar o grupo'}</Text>
        <TouchableOpacity style={s.primaryBtn} onPress={() => (isForbidden ? router.back() : refetch())}>
          <Text style={s.primaryBtnText}>{isForbidden ? 'Voltar' : 'Tentar novamente'}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const { group, isAdmin, members, upcomingMatches, balance } = data;
  const blockedCount = members.filter((m) => m.hasDebt || m.isInjured || m.isBlocked).length;
  const nextMatch = upcomingMatches[0];
  const reviewPaymentsCount = financeReport?.payments.filter((payment) => payment.status === 'PENDING' && !!payment.paymentReportedAt).length ?? 0;

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <BackButton />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={s.headerTitle} numberOfLines={1}>{group.name}</Text>
          <Text style={s.headerSub}>{members.length} membros</Text>
        </View>
        {isAdmin && (
          <TouchableOpacity
            style={s.iconBtn}
            onPress={() => router.push({ pathname: '/edit-group', params: { groupId } } as any)}
          >
            <Ionicons name="settings-outline" size={20} color={Colors.n700} />
          </TouchableOpacity>
        )}
      </View>

      <GroupTopMenu groupId={groupId!} active="summary" showFinance={isAdmin} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} colors={[Colors.primary]} />}
        contentContainerStyle={s.scroll}
      >
        <View style={s.actionsRow}>
          {isAdmin && (
            <QuickAction
              icon="person-add-outline"
              label="Convidar"
              onPress={() => router.push({ pathname: '/invite-athlete', params: { groupId, groupName: group.name } } as any)}
            />
          )}
          {isAdmin && (
            <QuickAction
              icon="football-outline"
              label="Nova partida"
              onPress={() => router.push({ pathname: '/create-match', params: { groupId } } as any)}
            />
          )}
          {isAdmin && (
            <QuickAction
              icon="wallet-outline"
              label="Financeiro"
              onPress={() => router.push({ pathname: '/group-finance', params: { groupId } } as any)}
            />
          )}
        </View>

        {isAdmin && reviewPaymentsCount > 0 && (
          <TouchableOpacity
            style={s.reviewCard}
            onPress={() => router.push({ pathname: '/group-finance', params: { groupId, tab: 'review' } } as any)}
            activeOpacity={0.8}
          >
            <View style={s.reviewIcon}>
              <Ionicons name="receipt-outline" size={22} color={Colors.warningDark} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={s.reviewTitle}>Pagamentos para conferir</Text>
              <Text style={s.reviewText}>
                {reviewPaymentsCount} pagamento{reviewPaymentsCount !== 1 ? 's' : ''} informado{reviewPaymentsCount !== 1 ? 's' : ''} aguardando conferência
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.n400} />
          </TouchableOpacity>
        )}

        <View style={s.grid}>
          <SummaryCard
            icon="people-outline"
            label="Membros"
            value={`${members.length}`}
            sub={blockedCount > 0 ? `${blockedCount} com alerta` : 'Grupo ativo'}
            onPress={() => router.push({ pathname: '/group-members', params: { groupId, tab: 'members' } } as any)}
          />
          {isAdmin && (
            <SummaryCard
              icon="star-outline"
              label="Avulsos"
              value={`${favoriteSpotAthletes.length}`}
              sub="Favoritos"
              onPress={() => router.push({ pathname: '/group-members', params: { groupId, tab: 'spot' } } as any)}
            />
          )}
          {isAdmin && balance && (
            <SummaryCard
              icon="wallet-outline"
              label="Em caixa"
              value={formatCurrency(balance.cashInHand)}
              sub={`${formatCurrency(balance.totalPending)} pendente`}
              onPress={() => router.push({ pathname: '/group-finance', params: { groupId } } as any)}
            />
          )}
          <SummaryCard
            icon="calendar-outline"
            label="Partidas"
            value={`${upcomingMatches.length}`}
            sub={nextMatch ? `Proxima: ${formatDate(nextMatch.date)}` : 'Nenhuma agendada'}
            onPress={() => router.push({ pathname: '/group-matches', params: { groupId } } as any)}
          />
        </View>

        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Proxima partida</Text>
            <TouchableOpacity onPress={() => router.push({ pathname: '/group-matches', params: { groupId } } as any)}>
              <Text style={s.sectionLink}>Ver jogos</Text>
            </TouchableOpacity>
          </View>
          {nextMatch ? (
            <MatchCompactCard
              match={nextMatch}
              onPress={() => router.push({ pathname: '/match-home', params: { matchId: nextMatch.id, groupId, isAdmin: isAdmin ? '1' : '0' } } as any)}
            />
          ) : (
            <View style={s.emptyCard}>
              <Ionicons name="football-outline" size={30} color={Colors.n300} />
              <Text style={s.emptyText}>Nenhuma partida agendada</Text>
              {isAdmin && (
                <TouchableOpacity
                  style={s.emptyAction}
                  onPress={() => router.push({ pathname: '/create-match', params: { groupId } } as any)}
                >
                  <Text style={s.emptyActionText}>Marcar partida</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickAction({ icon, label, onPress }: { icon: any; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={s.quickAction} onPress={onPress} activeOpacity={0.7}>
      <View style={s.quickActionIcon}>
        <Ionicons name={icon} size={20} color={Colors.primary} />
      </View>
      <Text style={s.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function SummaryCard({
  icon, label, value, sub, onPress,
}: {
  icon: any;
  label: string;
  value: string;
  sub: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={s.summaryCard} onPress={onPress} activeOpacity={0.75}>
      <Ionicons name={icon} size={20} color={Colors.primary} />
      <Text style={s.summaryValue} numberOfLines={1}>{value}</Text>
      <Text style={s.summaryLabel}>{label}</Text>
      <Text style={s.summarySub} numberOfLines={1}>{sub}</Text>
    </TouchableOpacity>
  );
}

function MatchCompactCard({ match, onPress }: { match: GroupUpcomingMatch; onPress: () => void }) {
  return (
    <TouchableOpacity style={s.matchCard} onPress={onPress} activeOpacity={0.75}>
      <View style={s.matchDateBox}>
        <Text style={s.matchDay}>{formatDate(match.date).split(',')[0]?.toUpperCase()}</Text>
        <Text style={s.matchDayNum}>{new Date(match.date).getDate()}</Text>
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={s.matchLocation} numberOfLines={1}>{match.location}</Text>
        <Text style={s.matchTime}>{formatTime(match.date)}</Text>
      </View>
      <View style={s.matchSpots}>
        <Text style={s.matchSpotsNum}>{match.confirmedCount}/{match.totalVacancies}</Text>
        <Text style={s.matchSpotsLabel}>confirmados</Text>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.n50 },
  center: { justifyContent: 'center', alignItems: 'center', gap: 8 },
  errorText: { fontSize: 14, color: Colors.n700 },
  primaryBtn: { marginTop: 8, paddingHorizontal: 18, paddingVertical: 10, backgroundColor: Colors.primary, borderRadius: Radius.r8 },
  primaryBtnText: { color: Colors.white, fontSize: 13, fontWeight: '700' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.n200, gap: 12 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: Colors.n900 },
  headerSub: { fontSize: 11, color: Colors.n500 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.n100, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingBottom: 28 },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: Colors.white, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.n200 },
  quickAction: { alignItems: 'center', gap: 6, minWidth: 76 },
  quickActionIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  quickActionLabel: { fontSize: 11, fontWeight: '700', color: Colors.n700 },
  reviewCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: Spacing.lg, marginTop: Spacing.lg, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.warningLight, borderRadius: Radius.r12, padding: Spacing.md },
  reviewIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.warningLight, alignItems: 'center', justifyContent: 'center' },
  reviewTitle: { fontSize: 13, fontWeight: '900', color: Colors.n900 },
  reviewText: { fontSize: 11, color: Colors.n600, marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, padding: Spacing.lg },
  summaryCard: { width: '48%', minHeight: 118, backgroundColor: Colors.white, borderRadius: Radius.r12, borderWidth: 1, borderColor: Colors.n200, padding: 14, gap: 4 },
  summaryValue: { fontSize: 19, fontWeight: '800', color: Colors.n900, marginTop: 4 },
  summaryLabel: { fontSize: 12, fontWeight: '700', color: Colors.n700 },
  summarySub: { fontSize: 11, color: Colors.n500 },
  section: { paddingHorizontal: Spacing.lg },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: Colors.n900 },
  sectionLink: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  emptyCard: { alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.r12, borderWidth: 1, borderColor: Colors.n200, paddingVertical: 24, gap: 8 },
  emptyText: { fontSize: 13, color: Colors.n500 },
  emptyAction: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: Colors.primary, borderRadius: Radius.r8 },
  emptyActionText: { color: Colors.white, fontWeight: '700', fontSize: 13 },
  matchCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.r12, borderWidth: 1, borderColor: Colors.n200, padding: Spacing.md, gap: 12 },
  matchDateBox: { width: 44, alignItems: 'center', backgroundColor: Colors.primaryLight, borderRadius: Radius.r8, paddingVertical: 6 },
  matchDay: { fontSize: 9, fontWeight: '700', color: Colors.primary },
  matchDayNum: { fontSize: 18, fontWeight: '800', color: Colors.primary },
  matchLocation: { fontSize: 13, fontWeight: '700', color: Colors.n900 },
  matchTime: { fontSize: 11, color: Colors.n500, marginTop: 2 },
  matchSpots: { alignItems: 'center' },
  matchSpotsNum: { fontSize: 14, fontWeight: '800', color: Colors.success },
  matchSpotsLabel: { fontSize: 10, color: Colors.n500 },
});
