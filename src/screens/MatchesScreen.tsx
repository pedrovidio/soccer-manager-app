import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { matchApi } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import { MatchListItem, MatchStatus } from '../types';
import { colors, typography, spacing, radius } from '../theme';
import { Badge, Button, Card } from '../components/UI';

// Temporário: o groupId virá do contexto de grupos quando integrarmos GroupsScreen
const PLACEHOLDER_GROUP_ID = '';

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }) +
    ' · ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

const statusConfig: Record<MatchStatus, { label: string; variant: 'success' | 'warning' | 'info' | 'danger' | 'neutral' }> = {
  SCHEDULED:   { label: 'Agendada',   variant: 'info' },
  IN_PROGRESS: { label: 'Em andamento', variant: 'warning' },
  FINISHED:    { label: 'Finalizada', variant: 'neutral' },
  CANCELLED:   { label: 'Cancelada',  variant: 'danger' },
};

export default function MatchesScreen({ navigation, route }: any) {
  const { athlete } = useAuth();
  const [tab, setTab] = useState<'upcoming' | 'history'>('upcoming');

  // groupId pode vir de params (quando navegar de GroupDetail) ou usar placeholder
  const groupId: string = route?.params?.groupId ?? PLACEHOLDER_GROUP_ID;

  const { data: matches, loading, error, refetch } = useFetch<MatchListItem[]>(
    () => groupId ? matchApi.listByGroup(groupId) : Promise.resolve([]),
    [groupId],
  );

  const upcoming = (matches ?? []).filter((m) => m.status === 'SCHEDULED' || m.status === 'IN_PROGRESS');
  const history  = (matches ?? []).filter((m) => m.status === 'FINISHED'  || m.status === 'CANCELLED');
  const displayed = tab === 'upcoming' ? upcoming : history;

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabBar}>
        {(['upcoming', 'history'] as const).map((t) => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'upcoming' ? 'Próximas' : 'Histórico'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.md, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} tintColor={colors.primary} />}
      >
        {/* Sem grupo selecionado */}
        {!groupId && (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color={colors.gray600} />
            <Text style={[typography.h3, { color: colors.black, marginTop: spacing.md }]}>Nenhum grupo selecionado</Text>
            <Text style={[typography.body, { color: colors.gray600, textAlign: 'center', marginTop: spacing.xs }]}>
              Acesse um grupo para ver as partidas.
            </Text>
            <Button label="Ver grupos" style={{ marginTop: spacing.lg }} onPress={() => navigation.navigate('Groups')} />
          </View>
        )}

        {/* Erro */}
        {error && (
          <View style={styles.emptyState}>
            <Ionicons name="alert-circle-outline" size={40} color={colors.red} />
            <Text style={[typography.body, { color: colors.red, marginTop: spacing.sm, textAlign: 'center' }]}>{error}</Text>
            <Button label="Tentar novamente" variant="secondary" style={{ marginTop: spacing.md }} onPress={refetch} />
          </View>
        )}

        {/* Loading */}
        {loading && groupId && (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
        )}

        {/* Lista */}
        {!loading && !error && groupId && displayed.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="football-outline" size={40} color={colors.gray600} />
            <Text style={[typography.body, { color: colors.gray600, marginTop: spacing.sm }]}>
              {tab === 'upcoming' ? 'Nenhuma partida agendada.' : 'Nenhuma partida no histórico.'}
            </Text>
          </View>
        )}

        {!loading && displayed.map((m) => {
          const cfg = statusConfig[m.status];
          return (
            <Card key={m.id} style={styles.matchCard}>
              <View style={styles.matchHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.body, { color: colors.black, fontWeight: '600' }]}>{formatDate(m.date)}</Text>
                  <Text style={[typography.caption, { color: colors.gray600 }]}>{m.location}</Text>
                </View>
                <Badge label={cfg.label} variant={cfg.variant} />
              </View>

              {/* VS row */}
              <View style={styles.vsRow}>
                <View style={styles.teamBlock}>
                  <View style={styles.teamIcon}>
                    <Ionicons name="shield" size={24} color={colors.primary} />
                  </View>
                  <Text style={[typography.caption, { color: colors.black, marginTop: 4 }]}>{m.type}</Text>
                </View>
                <View style={styles.scoreBlock}>
                  <Text style={[typography.h2, { color: colors.gray600 }]}>VS</Text>
                  <Text style={[typography.caption, { color: colors.gray600 }]}>
                    {m.confirmedCount}/{m.totalVacancies} confirmados
                  </Text>
                </View>
                <View style={styles.teamBlock}>
                  <View style={[styles.teamIcon, { backgroundColor: '#FEF3C7' }]}>
                    <Ionicons name="shield-outline" size={24} color={colors.orange} />
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={styles.detailBtn}
                onPress={() => navigation.navigate('MatchDetail', { matchId: m.id, groupId })}
              >
                <Text style={[typography.caption, { color: colors.primary, fontWeight: '600' }]}>Ver detalhes →</Text>
              </TouchableOpacity>
            </Card>
          );
        })}

        {groupId && (
          <Button
            label="+ Criar nova partida"
            fullWidth
            style={{ marginTop: displayed.length > 0 ? 0 : spacing.sm }}
            onPress={() => navigation.navigate('CreateMatch', { groupId })}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  tabBar: {
    flexDirection: 'row', backgroundColor: colors.white,
    paddingHorizontal: spacing.md, paddingTop: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.gray200,
  },
  tab: {
    paddingVertical: spacing.sm, paddingHorizontal: spacing.md,
    marginRight: spacing.sm, borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: colors.primary },
  tabText: { fontSize: 14, color: colors.gray600 },
  tabTextActive: { color: colors.primary, fontWeight: '600' },
  matchCard: { marginBottom: spacing.md },
  matchHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  vsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginBottom: spacing.sm },
  teamBlock: { alignItems: 'center', width: 80 },
  teamIcon: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center',
  },
  scoreBlock: { alignItems: 'center', gap: 2 },
  detailBtn: { alignSelf: 'flex-end', paddingTop: spacing.xs },
  emptyState: { alignItems: 'center', paddingTop: spacing.xl, paddingHorizontal: spacing.lg },
});
