import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { groupApi } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import { GroupBalance, FinancialTransaction, TransactionStatus } from '../types';
import { colors, typography, spacing, radius } from '../theme';
import { Badge, Button, Card, Divider } from '../components/UI';

// groupId virá de params quando integrado com GroupDetail
const PLACEHOLDER_GROUP_ID = '';

const statusConfig: Record<TransactionStatus, { label: string; variant: 'success' | 'warning' | 'danger' | 'neutral' }> = {
  PENDING:   { label: 'Pendente',   variant: 'warning' },
  PAID:      { label: 'Pago',       variant: 'success' },
  CANCELLED: { label: 'Cancelado',  variant: 'neutral' },
};

const typeLabel: Record<string, string> = {
  MONTHLY:            'Mensalidade',
  SPOT:               'Partida avulsa',
  GOALKEEPER_SERVICE: 'Goleiro de aluguel',
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const TABS = ['Pendentes', 'Pagos', 'Histórico'] as const;
type Tab = typeof TABS[number];

export default function FinancialScreen({ route }: any) {
  const { athlete } = useAuth();
  const [tab, setTab] = useState<Tab>('Pendentes');

  const groupId: string = route?.params?.groupId ?? PLACEHOLDER_GROUP_ID;

  const { data: balance, loading, refetch } = useFetch<GroupBalance>(
    () => groupId ? groupApi.balance(groupId, athlete!.id) : Promise.resolve({ totalPaid: 0, totalPending: 0, transactions: [] }),
    [groupId, athlete?.id],
  );

  const transactions = balance?.transactions ?? [];

  const filtered = transactions.filter((t) => {
    if (tab === 'Pendentes') return t.status === 'PENDING';
    if (tab === 'Pagos')     return t.status === 'PAID';
    return true;
  });

  const summaryValue = tab === 'Pendentes'
    ? (balance?.totalPending ?? 0)
    : tab === 'Pagos'
    ? (balance?.totalPaid ?? 0)
    : (balance?.totalPaid ?? 0) + (balance?.totalPending ?? 0);

  const summaryLabel = tab === 'Pendentes' ? 'TOTAL PENDENTE' : tab === 'Pagos' ? 'TOTAL PAGO' : 'TOTAL GERAL';

  return (
    <View style={styles.container}>
      {/* Summary */}
      <View style={[styles.summaryCard, tab === 'Pagos' && { backgroundColor: colors.green }]}>
        <Text style={[typography.caption, { color: 'rgba(255,255,255,0.8)' }]}>{summaryLabel}</Text>
        {loading ? (
          <ActivityIndicator color={colors.white} style={{ marginTop: spacing.sm }} />
        ) : (
          <>
            <Text style={[typography.h1, { color: colors.white, marginTop: 4 }]}>
              R$ {summaryValue.toFixed(2).replace('.', ',')}
            </Text>
            <Text style={[typography.caption, { color: 'rgba(255,255,255,0.7)' }]}>
              {filtered.length} {filtered.length === 1 ? 'cobrança' : 'cobranças'}
            </Text>
          </>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {TABS.map((t) => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.md, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} tintColor={colors.primary} />}
      >
        {!groupId && (
          <View style={styles.emptyState}>
            <Ionicons name="card-outline" size={40} color={colors.gray600} />
            <Text style={[typography.body, { color: colors.gray600, marginTop: spacing.sm, textAlign: 'center' }]}>
              Acesse um grupo para ver o financeiro.
            </Text>
          </View>
        )}

        {groupId && !loading && filtered.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={40} color={colors.green} />
            <Text style={[typography.body, { color: colors.gray600, marginTop: spacing.sm }]}>
              Nenhuma cobrança {tab === 'Pendentes' ? 'pendente' : tab === 'Pagos' ? 'paga' : ''}.
            </Text>
          </View>
        )}

        {groupId && filtered.length > 0 && (
          <Card>
            {filtered.map((t, i) => {
              const cfg = statusConfig[t.status];
              return (
                <View key={t.id}>
                  <View style={styles.transactionRow}>
                    <View style={styles.transactionIcon}>
                      <Ionicons name="receipt-outline" size={18} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[typography.body, { color: colors.black, fontWeight: '600' }]}>
                        {typeLabel[t.type] ?? t.type}
                      </Text>
                      <Text style={[typography.caption, { color: colors.gray600 }]}>
                        {formatDate(t.createdAt)}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                      <Text style={[typography.body, { color: colors.black, fontWeight: '700' }]}>
                        R$ {t.amount.toFixed(2).replace('.', ',')}
                      </Text>
                      <Badge label={cfg.label} variant={cfg.variant} />
                    </View>
                  </View>
                  {i < filtered.length - 1 && <Divider />}
                </View>
              );
            })}
          </Card>
        )}
      </ScrollView>

      {tab === 'Pendentes' && filtered.length > 0 && (
        <View style={styles.footer}>
          <Button label="💳  Pagar com PIX" fullWidth />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  summaryCard: { backgroundColor: colors.primary, padding: spacing.lg, paddingBottom: spacing.xl },
  tabBar: {
    flexDirection: 'row', backgroundColor: colors.white,
    borderBottomWidth: 1, borderBottomColor: colors.gray200,
  },
  tab: {
    flex: 1, paddingVertical: spacing.sm, alignItems: 'center',
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: colors.primary },
  tabText: { fontSize: 14, color: colors.gray600 },
  tabTextActive: { color: colors.primary, fontWeight: '600' },
  transactionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, gap: spacing.sm },
  transactionIcon: {
    width: 40, height: 40, borderRadius: radius.md,
    backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center',
  },
  footer: { padding: spacing.md, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.gray200 },
  emptyState: { alignItems: 'center', paddingTop: spacing.xl },
});
