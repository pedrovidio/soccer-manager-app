import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator, RefreshControl, SafeAreaView, ScrollView, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { BackButton } from '../../common/components/BackButton';
import { Colors, Radius, Spacing } from '../../common/theme';
import { useAuthStore } from '../../auth/useAuthStore';
import { groupApi } from '../services/groupApi';
import { GroupFinancePayment, GroupFinanceStatus, GroupFinanceType } from '../groupTypes';

type Tab = 'overview' | 'matches' | 'defaulters' | 'payments';
type StatusFilter = 'ALL' | GroupFinanceStatus;
type TypeFilter = 'ALL' | GroupFinanceType;

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(value?: string | null) {
  if (!value) return 'Sem data';
  return new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function statusLabel(status: GroupFinanceStatus) {
  const map = { PENDING: 'Pendente', PAID: 'Pago', CANCELLED: 'Cancelado' };
  return map[status];
}

function typeLabel(type: GroupFinanceType) {
  return type === 'SPOT' ? 'Avulso' : 'Mensalidade';
}

export default function GroupFinanceScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const athleteId = useAuthStore((s) => s.athleteId) ?? '';
  const [tab, setTab] = useState<Tab>('overview');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');

  const filters = useMemo(() => ({
    ...(statusFilter !== 'ALL' && { status: statusFilter }),
    ...(typeFilter !== 'ALL' && { type: typeFilter }),
  }), [statusFilter, typeFilter]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['group-finance-report', groupId, athleteId, filters],
    queryFn: () => groupApi.financeReport(groupId!, athleteId, filters),
    enabled: !!groupId && !!athleteId,
  });

  if (isLoading) {
    return (
      <SafeAreaView style={[s.safe, s.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (isError || !data) {
    return (
      <SafeAreaView style={[s.safe, s.center]}>
        <Ionicons name="alert-circle-outline" size={42} color={Colors.error} />
        <Text style={s.errorText}>Erro ao carregar financeiro</Text>
        <TouchableOpacity style={s.primaryBtn} onPress={() => refetch()}>
          <Text style={s.primaryBtnText}>Tentar novamente</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const reportedPayments = data.payments.filter((payment) => payment.status === 'PENDING' && payment.paymentReportedAt);
  const overduePayments = data.defaulters.filter((payment) => payment.isOverdue);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <BackButton />
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Financeiro</Text>
          <Text style={s.headerSub} numberOfLines={1}>{data.group.name}</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} colors={[Colors.primary]} />}
      >
        <View style={s.summaryGrid}>
          <MetricCard label="Em caixa" value={formatCurrency(data.summary.cashInHand)} tone="success" />
          <MetricCard label="A receber" value={formatCurrency(data.summary.totalPending)} tone="warning" />
          <MetricCard label="Vencido" value={formatCurrency(data.summary.totalOverdue)} tone="error" />
          <MetricCard label="Informado" value={formatCurrency(data.summary.totalReported)} tone="neutral" />
        </View>

        <View style={s.filterBlock}>
          <Text style={s.filterTitle}>Filtros</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>
            <Chip label="Todos" active={statusFilter === 'ALL'} onPress={() => setStatusFilter('ALL')} />
            <Chip label="Pendentes" active={statusFilter === 'PENDING'} onPress={() => setStatusFilter('PENDING')} />
            <Chip label="Pagos" active={statusFilter === 'PAID'} onPress={() => setStatusFilter('PAID')} />
            <Chip label="Cancelados" active={statusFilter === 'CANCELLED'} onPress={() => setStatusFilter('CANCELLED')} />
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>
            <Chip label="Todas receitas" active={typeFilter === 'ALL'} onPress={() => setTypeFilter('ALL')} />
            <Chip label="Avulsos" active={typeFilter === 'SPOT'} onPress={() => setTypeFilter('SPOT')} />
            <Chip label="Mensalidades" active={typeFilter === 'MONTHLY'} onPress={() => setTypeFilter('MONTHLY')} />
          </ScrollView>
        </View>

        <View style={s.tabs}>
          <TabButton label="Resumo" active={tab === 'overview'} onPress={() => setTab('overview')} />
          <TabButton label="Jogos" active={tab === 'matches'} onPress={() => setTab('matches')} />
          <TabButton label="Inadimplentes" active={tab === 'defaulters'} onPress={() => setTab('defaulters')} />
          <TabButton label="Lançamentos" active={tab === 'payments'} onPress={() => setTab('payments')} />
        </View>

        {tab === 'overview' && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Receitas por tipo</Text>
            {data.byType.map((item) => (
              <View key={item.type} style={s.reportRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.rowTitle}>{typeLabel(item.type)}</Text>
                  <Text style={s.rowSub}>{item.count} lançamento(s)</Text>
                </View>
                <View style={s.amounts}>
                  <Text style={s.paidText}>{formatCurrency(item.paid)}</Text>
                  <Text style={s.pendingText}>{formatCurrency(item.pending)} pendente</Text>
                </View>
              </View>
            ))}

            <Text style={[s.sectionTitle, { marginTop: 18 }]}>Alertas</Text>
            <AlertLine icon="time-outline" label="Pagamentos vencidos" value={`${overduePayments.length}`} tone="error" />
            <AlertLine icon="receipt-outline" label="Pagamentos informados aguardando conferência" value={`${reportedPayments.length}`} tone="warning" />
            <AlertLine icon="wallet-outline" label="Total previsto" value={formatCurrency(data.summary.expectedTotal)} tone="neutral" />
          </View>
        )}

        {tab === 'matches' && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Arrecadação por jogo</Text>
            {data.byMatch.length === 0 ? (
              <EmptyState text="Nenhuma receita vinculada a partidas" />
            ) : data.byMatch.map((match) => (
              <View key={match.matchId} style={s.matchCard}>
                <View style={{ flex: 1 }}>
                  <Text style={s.rowTitle} numberOfLines={1}>{match.matchLocation}</Text>
                  <Text style={s.rowSub}>{formatDate(match.matchDate)} · {match.transactionCount} cobrança(s)</Text>
                </View>
                <View style={s.amounts}>
                  <Text style={s.paidText}>{formatCurrency(match.paid)}</Text>
                  <Text style={s.pendingText}>{formatCurrency(match.pending)} pendente</Text>
                  {match.overdue > 0 && <Text style={s.overdueText}>{formatCurrency(match.overdue)} vencido</Text>}
                </View>
              </View>
            ))}
          </View>
        )}

        {tab === 'defaulters' && (
          <PaymentList
            title="Inadimplentes e pendências"
            empty="Nenhum pagamento pendente"
            payments={data.defaulters}
          />
        )}

        {tab === 'payments' && (
          <PaymentList
            title="Todos os lançamentos"
            empty="Nenhum lançamento encontrado"
            payments={data.payments}
          />
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricCard({ label, value, tone }: { label: string; value: string; tone: 'success' | 'warning' | 'error' | 'neutral' }) {
  const color = tone === 'success' ? Colors.successDark : tone === 'warning' ? Colors.warningDark : tone === 'error' ? Colors.errorDark : Colors.n900;
  const bg = tone === 'success' ? Colors.successLight : tone === 'warning' ? Colors.warningLight : tone === 'error' ? Colors.errorLight : Colors.white;
  return (
    <View style={[s.metricCard, { backgroundColor: bg }]}>
      <Text style={s.metricLabel}>{label}</Text>
      <Text style={[s.metricValue, { color }]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[s.chip, active && s.chipActive]} onPress={onPress} activeOpacity={0.7}>
      <Text style={[s.chipText, active && s.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[s.tabBtn, active && s.tabBtnActive]} onPress={onPress} activeOpacity={0.7}>
      <Text style={[s.tabText, active && s.tabTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function AlertLine({ icon, label, value, tone }: { icon: any; label: string; value: string; tone: 'warning' | 'error' | 'neutral' }) {
  const color = tone === 'warning' ? Colors.warningDark : tone === 'error' ? Colors.errorDark : Colors.n700;
  return (
    <View style={s.alertLine}>
      <Ionicons name={icon} size={18} color={color} />
      <Text style={s.alertLabel}>{label}</Text>
      <Text style={[s.alertValue, { color }]}>{value}</Text>
    </View>
  );
}

function PaymentList({ title, empty, payments }: { title: string; empty: string; payments: GroupFinancePayment[] }) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      {payments.length === 0 ? (
        <EmptyState text={empty} />
      ) : payments.map((payment) => (
        <PaymentRow key={payment.id} payment={payment} />
      ))}
    </View>
  );
}

function PaymentRow({ payment }: { payment: GroupFinancePayment }) {
  const statusTone = payment.status === 'PAID' ? Colors.successDark : payment.isOverdue ? Colors.errorDark : Colors.warningDark;
  return (
    <View style={s.paymentRow}>
      <View style={{ flex: 1 }}>
        <Text style={s.rowTitle} numberOfLines={1}>{payment.athleteName}</Text>
        <Text style={s.rowSub} numberOfLines={1}>
          {typeLabel(payment.type)} · {payment.matchLocation ?? 'Sem partida'} · vence {formatDate(payment.dueDate)}
        </Text>
        {payment.paymentReportedAt && payment.status === 'PENDING' && (
          <Text style={s.reportedText}>Pagamento informado, aguardando confirmação</Text>
        )}
      </View>
      <View style={s.amounts}>
        <Text style={s.amountText}>{formatCurrency(payment.amount)}</Text>
        <Text style={[s.statusText, { color: statusTone }]}>
          {payment.isOverdue ? 'Vencido' : statusLabel(payment.status)}
        </Text>
      </View>
    </View>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <View style={s.emptyCard}>
      <Ionicons name="file-tray-outline" size={30} color={Colors.n300} />
      <Text style={s.emptyText}>{text}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  safe:             { flex: 1, backgroundColor: Colors.n50 },
  center:           { justifyContent: 'center', alignItems: 'center', gap: 10, padding: 24 },
  header:           { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.n200, gap: 12 },
  headerTitle:      { fontSize: 16, fontWeight: '800', color: Colors.n900 },
  headerSub:        { fontSize: 12, color: Colors.n500, marginTop: 1 },
  errorText:        { fontSize: 14, color: Colors.n700 },
  primaryBtn:       { backgroundColor: Colors.primary, paddingHorizontal: 18, paddingVertical: 10, borderRadius: Radius.r8 },
  primaryBtnText:   { color: Colors.white, fontWeight: '700' },
  summaryGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 10, padding: Spacing.lg },
  metricCard:       { width: '48%', borderRadius: Radius.r12, borderWidth: 1, borderColor: Colors.n200, padding: 12 },
  metricLabel:      { fontSize: 11, color: Colors.n500, marginBottom: 6 },
  metricValue:      { fontSize: 17, fontWeight: '900' },
  filterBlock:      { paddingHorizontal: Spacing.lg, gap: 8 },
  filterTitle:      { fontSize: 12, fontWeight: '800', color: Colors.n700 },
  chips:            { gap: 8, paddingRight: Spacing.lg },
  chip:             { borderRadius: Radius.r999, borderWidth: 1, borderColor: Colors.n200, backgroundColor: Colors.white, paddingHorizontal: 12, paddingVertical: 7 },
  chipActive:       { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText:         { fontSize: 12, fontWeight: '700', color: Colors.n600 },
  chipTextActive:   { color: Colors.white },
  tabs:             { flexDirection: 'row', margin: Spacing.lg, backgroundColor: Colors.n100, borderRadius: Radius.r12, padding: 4 },
  tabBtn:           { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: Radius.r8 },
  tabBtnActive:     { backgroundColor: Colors.white },
  tabText:          { fontSize: 11, fontWeight: '700', color: Colors.n500 },
  tabTextActive:    { color: Colors.primary },
  section:          { paddingHorizontal: Spacing.lg, gap: 8 },
  sectionTitle:     { fontSize: 14, fontWeight: '900', color: Colors.n900, marginBottom: 2 },
  reportRow:        { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.r12, borderWidth: 1, borderColor: Colors.n200, padding: 12, gap: 10 },
  matchCard:        { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.r12, borderWidth: 1, borderColor: Colors.n200, padding: 12, gap: 10 },
  paymentRow:       { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.r12, borderWidth: 1, borderColor: Colors.n200, padding: 12, gap: 10 },
  rowTitle:         { fontSize: 13, fontWeight: '800', color: Colors.n900 },
  rowSub:           { fontSize: 11, color: Colors.n500, marginTop: 3 },
  amounts:          { alignItems: 'flex-end', maxWidth: 132 },
  paidText:         { fontSize: 13, fontWeight: '900', color: Colors.successDark },
  pendingText:      { fontSize: 11, fontWeight: '700', color: Colors.warningDark, marginTop: 2 },
  overdueText:      { fontSize: 11, fontWeight: '700', color: Colors.errorDark, marginTop: 2 },
  amountText:       { fontSize: 13, fontWeight: '900', color: Colors.n900 },
  statusText:       { fontSize: 11, fontWeight: '800', marginTop: 2 },
  reportedText:     { fontSize: 11, fontWeight: '700', color: Colors.warningDark, marginTop: 4 },
  alertLine:        { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.r12, borderWidth: 1, borderColor: Colors.n200, padding: 12, gap: 8 },
  alertLabel:       { flex: 1, fontSize: 12, fontWeight: '700', color: Colors.n700 },
  alertValue:       { fontSize: 13, fontWeight: '900' },
  emptyCard:        { alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.r12, borderWidth: 1, borderColor: Colors.n200, paddingVertical: 24, gap: 8 },
  emptyText:        { fontSize: 13, color: Colors.n500 },
});
