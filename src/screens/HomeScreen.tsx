import React, { useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { athleteApi, matchApi } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import { AthleteDashboard, MatchListItem } from '../types';
import { colors, typography, spacing, radius } from '../theme';
import { Button, Card, SectionTitle } from '../components/UI';

function formatMatchDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }) +
    ' · ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function HomeScreen({ navigation }: any) {
  const { athlete, refreshAthlete } = useAuth();

  const { data: dashboard, loading: loadingDash, refetch: refetchDash } = useFetch<AthleteDashboard>(
    () => athleteApi.dashboard(athlete!.id),
    [athlete?.id],
  );

  // Busca partidas do primeiro grupo do atleta (se existir)
  const { data: nextMatch, loading: loadingMatch, refetch: refetchMatch } = useFetch<MatchListItem | null>(
    async () => {
      // Retorna null se não houver grupos — tela mostra estado vazio
      return null;
    },
    [],
  );

  const onRefresh = useCallback(() => {
    refetchDash();
    refetchMatch();
    refreshAthlete();
  }, [refetchDash, refetchMatch, refreshAthlete]);

  const initials = athlete?.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() ?? '?';

  const overallHistory = (dashboard?.overallEvolution ?? []).map((e) => e.overall);
  const maxVal = Math.max(...overallHistory, 1);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={loadingDash} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[typography.h2, { color: colors.black }]}>
            Olá, {athlete?.name.split(' ')[0]}! 👋
          </Text>
          <Text style={[typography.body, { color: colors.gray600 }]}>Bora jogar hoje?</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Profile', { screen: 'Notifications' })}>
            <Ionicons name="notifications-outline" size={22} color={colors.black} />
          </TouchableOpacity>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        </View>
      </View>

      {/* Próxima Partida — estado vazio */}
      <Card style={styles.nextMatchCard}>
        <Text style={[typography.caption, { color: colors.white, opacity: 0.8, marginBottom: 4 }]}>PRÓXIMA PARTIDA</Text>
        {loadingMatch ? (
          <ActivityIndicator color={colors.white} />
        ) : nextMatch ? (
          <>
            <Text style={[typography.h3, { color: colors.white }]}>{formatMatchDate(nextMatch.date)}</Text>
            <Text style={[typography.body, { color: colors.white, opacity: 0.9 }]}>{nextMatch.location}</Text>
            <View style={styles.vsRow}>
              <View style={styles.teamBlock}>
                <View style={styles.teamIcon}><Ionicons name="shield" size={28} color={colors.white} /></View>
              </View>
              <Text style={[typography.h2, { color: colors.white }]}>VS</Text>
              <View style={styles.teamBlock}>
                <View style={styles.teamIcon}><Ionicons name="shield-outline" size={28} color={colors.white} /></View>
              </View>
            </View>
            <Button
              label="Ver detalhes"
              variant="secondary"
              fullWidth
              onPress={() => navigation.navigate('Matches', { screen: 'MatchDetail', params: { matchId: nextMatch.id } })}
            />
          </>
        ) : (
          <View style={styles.emptyMatch}>
            <Ionicons name="football-outline" size={32} color="rgba(255,255,255,0.5)" />
            <Text style={[typography.body, { color: 'rgba(255,255,255,0.7)', marginTop: spacing.sm, textAlign: 'center' }]}>
              Nenhuma partida agendada.{'\n'}Entre em um grupo para começar!
            </Text>
            <Button
              label="Ver grupos"
              variant="secondary"
              style={{ marginTop: spacing.md }}
              onPress={() => navigation.navigate('Groups')}
            />
          </View>
        )}
      </Card>

      {/* Performance */}
      <View style={{ paddingHorizontal: spacing.md, marginTop: spacing.lg }}>
        <SectionTitle title="Resumo da sua performance" action="Ver tudo" onAction={() => navigation.navigate('Profile')} />
        <Card>
          {loadingDash ? (
            <ActivityIndicator color={colors.primary} style={{ paddingVertical: spacing.lg }} />
          ) : (
            <>
              <View style={styles.statsRow}>
                {[
                  { label: 'Jogos',   value: dashboard?.totalMatches ?? 0 },
                  { label: 'Overall', value: dashboard?.averageStats?.overall ?? 0 },
                  { label: 'Partidas recentes', value: dashboard?.recentMatches?.length ?? 0 },
                ].map((s) => (
                  <View key={s.label} style={styles.statItem}>
                    <Text style={[typography.h2, { color: colors.black }]}>{s.value}</Text>
                    <Text style={[typography.caption, { color: colors.gray600 }]}>{s.label}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.ratingRow}>
                <Text style={[typography.body, { color: colors.gray600 }]}>Média Rating</Text>
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={12} color={colors.orange} />
                  <Text style={[typography.body, { color: colors.black, fontWeight: '700', marginLeft: 4 }]}>
                    {dashboard?.averageStats?.overall ?? 0}
                  </Text>
                </View>
              </View>

              {overallHistory.length > 0 && (
                <>
                  <Text style={[typography.caption, { color: colors.gray600, marginTop: spacing.sm }]}>
                    EVOLUÇÃO DO OVERALL · Últimos {overallHistory.length} jogos
                  </Text>
                  <View style={styles.chartContainer}>
                    {overallHistory.map((v, i) => (
                      <View key={i} style={styles.chartBarWrapper}>
                        <View style={[styles.chartBar, { height: (v / maxVal) * 56 }]} />
                      </View>
                    ))}
                    <View style={styles.chartDot}>
                      <Text style={styles.chartDotText}>{dashboard?.averageStats?.overall ?? 0}</Text>
                    </View>
                  </View>
                </>
              )}
            </>
          )}
        </Card>
      </View>

      {/* Alerta de inadimplência */}
      {(athlete?.financialDebt ?? 0) > 0 && (
        <TouchableOpacity
          style={styles.debtAlert}
          onPress={() => navigation.navigate('Financial')}
        >
          <Ionicons name="warning" size={18} color={colors.red} />
          <Text style={[typography.body, { color: colors.red, flex: 1, marginLeft: spacing.sm }]}>
            Você tem pendências financeiras. Regularize para confirmar presença.
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.red} />
        </TouchableOpacity>
      )}

      {/* Alerta de avaliação pendente */}
      {!athlete?.hasCompletedAssessment && (
        <TouchableOpacity
          style={styles.assessmentAlert}
          onPress={() => navigation.navigate('Profile', { screen: 'Assessment' })}
        >
          <Ionicons name="clipboard-outline" size={18} color={colors.primary} />
          <Text style={[typography.body, { color: colors.primary, flex: 1, marginLeft: spacing.sm }]}>
            Complete sua autoavaliação técnica para receber um Overall inicial.
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerIcons: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconBtn: { padding: 4 },
  avatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: colors.white, fontWeight: '700', fontSize: 15 },
  nextMatchCard: {
    marginHorizontal: spacing.md,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
  },
  vsRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-around', marginVertical: spacing.md,
  },
  teamBlock: { alignItems: 'center' },
  teamIcon: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  emptyMatch: { alignItems: 'center', paddingVertical: spacing.md },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: spacing.md },
  statItem: { alignItems: 'center' },
  ratingRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.gray200,
  },
  ratingBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FEF3C7', paddingHorizontal: spacing.sm,
    paddingVertical: 4, borderRadius: radius.full,
  },
  chartContainer: {
    flexDirection: 'row', alignItems: 'flex-end',
    height: 60, marginTop: spacing.sm, gap: 6,
  },
  chartBarWrapper: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  chartBar: { width: '100%', backgroundColor: `${colors.primary}40`, borderRadius: 4 },
  chartDot: {
    position: 'absolute', right: 0, bottom: 0,
    backgroundColor: colors.primary, borderRadius: radius.full,
    width: 28, height: 28, alignItems: 'center', justifyContent: 'center',
  },
  chartDotText: { color: colors.white, fontSize: 10, fontWeight: '700' },
  debtAlert: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: spacing.md, marginTop: spacing.md,
    backgroundColor: '#FEE2E2', borderRadius: radius.md,
    padding: spacing.md, gap: spacing.xs,
  },
  assessmentAlert: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: spacing.md, marginTop: spacing.sm,
    backgroundColor: '#DBEAFE', borderRadius: radius.md,
    padding: spacing.md, gap: spacing.xs,
  },
});
