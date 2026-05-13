import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator, Alert, Modal, Pressable, RefreshControl, SafeAreaView, ScrollView,
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { BackButton } from '../../common/components/BackButton';
import { BottomNav } from '../../common/components/BottomNav/BottomNav';
import { Colors, Radius, Spacing } from '../../common/theme';
import { useAuthStore } from '../../auth/useAuthStore';
import { athleteApi } from '../services/athleteApi';
import { AthleteFinancePayment, AthleteFinanceStatus, AthleteFinanceType } from '../athleteTypes';

type Tab = 'due' | 'history' | 'reports';
type StatusFilter = 'ALL' | AthleteFinanceStatus;
type TypeFilter = 'ALL' | AthleteFinanceType;

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(value?: string | null) {
  if (!value) return 'Sem data';
  return new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function typeLabel(type: AthleteFinanceType) {
  return type === 'SPOT' ? 'Jogo avulso' : 'Mensalidade';
}

function statusLabel(payment: AthleteFinancePayment) {
  if (payment.isOverdue) return 'Vencido';
  if (payment.status === 'PAID') return 'Pago';
  if (payment.status === 'CANCELLED') return 'Cancelado';
  return payment.paymentReportedAt ? 'Informado' : 'Pendente';
}

export default function AthleteFinanceScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const athleteId = useAuthStore((s) => s.athleteId) ?? '';
  const [tab, setTab] = useState<Tab>('due');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');
  const [selectedPayment, setSelectedPayment] = useState<AthleteFinancePayment | null>(null);

  const filters = useMemo(() => ({
    ...(statusFilter !== 'ALL' && { status: statusFilter }),
    ...(typeFilter !== 'ALL' && { type: typeFilter }),
  }), [statusFilter, typeFilter]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['athlete-finance-report', athleteId, filters],
    queryFn: () => athleteApi.financeReport(athleteId, filters),
    enabled: !!athleteId,
  });

  const reportMonthlyPaymentMutation = useMutation({
    mutationFn: (transactionId: string) => athleteApi.reportMonthlyPayment(transactionId),
    onSuccess: () => {
      setSelectedPayment(null);
      qc.invalidateQueries({ queryKey: ['athlete-finance-report', athleteId] });
      Alert.alert('Pagamento informado', 'O administrador foi avisado para conferir o Pix.');
    },
    onError: () => Alert.alert('Erro', 'Nao foi possivel informar o pagamento.'),
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
        <BottomNav active="financial" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <BackButton />
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Meu financeiro</Text>
          <Text style={s.headerSub}>{data.athlete.name}</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} colors={[Colors.primary]} />}
      >
        <View style={s.summaryGrid}>
          <MetricCard label="Pendente" value={formatCurrency(data.summary.totalPending)} tone="warning" />
          <MetricCard label="Vencido" value={formatCurrency(data.summary.totalOverdue)} tone="error" />
          <MetricCard label="Pago" value={formatCurrency(data.summary.totalPaid)} tone="success" />
          <MetricCard label="Informado" value={formatCurrency(data.summary.totalReported)} tone="neutral" />
        </View>

        <View style={s.filterBlock}>
          <Text style={s.filterTitle}>Filtros</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>
            <Chip label="Todos" active={statusFilter === 'ALL'} onPress={() => setStatusFilter('ALL')} />
            <Chip label="Pendentes" active={statusFilter === 'PENDING'} onPress={() => setStatusFilter('PENDING')} />
            <Chip label="Pagos" active={statusFilter === 'PAID'} onPress={() => setStatusFilter('PAID')} />
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>
            <Chip label="Todos tipos" active={typeFilter === 'ALL'} onPress={() => setTypeFilter('ALL')} />
            <Chip label="Jogos avulsos" active={typeFilter === 'SPOT'} onPress={() => setTypeFilter('SPOT')} />
            <Chip label="Mensalista" active={typeFilter === 'MONTHLY'} onPress={() => setTypeFilter('MONTHLY')} />
          </ScrollView>
        </View>

        <View style={s.tabs}>
          <TabButton label="Pagar" active={tab === 'due'} onPress={() => setTab('due')} />
          <TabButton label="Histórico" active={tab === 'history'} onPress={() => setTab('history')} />
          <TabButton label="Relatórios" active={tab === 'reports'} onPress={() => setTab('reports')} />
        </View>

        {tab === 'due' && (
          <PaymentList
            title="Valores em aberto"
            empty="Nenhum pagamento pendente"
            payments={data.duePayments}
            onPay={setSelectedPayment}
          />
        )}

        {tab === 'history' && (
          <PaymentList
            title="Histórico de pagamentos"
            empty="Nenhum pagamento encontrado"
            payments={data.payments}
            onPay={setSelectedPayment}
          />
        )}

        {tab === 'reports' && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Por tipo</Text>
            {data.byType.map((item) => (
              <ReportRow
                key={item.type}
                title={typeLabel(item.type)}
                subtitle={`${item.count} lançamento(s)`}
                paid={item.paid}
                pending={item.pending}
                overdue={item.overdue}
              />
            ))}

            <Text style={[s.sectionTitle, { marginTop: 18 }]}>Por grupo</Text>
            {data.byGroup.length === 0 ? (
              <EmptyState text="Nenhum grupo com lançamentos" />
            ) : data.byGroup.map((item) => (
              <ReportRow
                key={item.groupId}
                title={item.groupName}
                subtitle={`${item.count} lançamento(s)`}
                paid={item.paid}
                pending={item.pending}
                overdue={item.overdue}
              />
            ))}
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>

      <PaymentModal
        payment={selectedPayment}
        isReporting={reportMonthlyPaymentMutation.isPending}
        onReportPayment={(payment) => reportMonthlyPaymentMutation.mutate(payment.id)}
        onClose={() => setSelectedPayment(null)}
        onOpenMatch={(payment) => {
          setSelectedPayment(null);
          if (payment.match?.id) {
            router.push({ pathname: '/match-home', params: { matchId: payment.match.id, groupId: payment.group?.id ?? '', isAdmin: '0' } } as any);
          }
        }}
      />

      <BottomNav active="financial" />
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

function PaymentList({
  title, empty, payments, onPay,
}: {
  title: string;
  empty: string;
  payments: AthleteFinancePayment[];
  onPay: (payment: AthleteFinancePayment) => void;
}) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      {payments.length === 0 ? (
        <EmptyState text={empty} />
      ) : payments.map((payment) => (
        <PaymentRow key={payment.id} payment={payment} onPay={() => onPay(payment)} />
      ))}
    </View>
  );
}

function PaymentRow({ payment, onPay }: { payment: AthleteFinancePayment; onPay: () => void }) {
  const canPay = payment.status === 'PENDING';
  const color = payment.status === 'PAID' ? Colors.successDark : payment.isOverdue ? Colors.errorDark : Colors.warningDark;
  return (
    <View style={s.paymentRow}>
      <View style={{ flex: 1 }}>
        <Text style={s.rowTitle} numberOfLines={1}>{typeLabel(payment.type)}</Text>
        <Text style={s.rowSub} numberOfLines={1}>
          {payment.group?.name ?? 'Sem grupo'} · {payment.match?.location ?? 'Mensalidade'} · vence {formatDate(payment.dueDate)}
        </Text>
        {payment.paymentReportedAt && payment.status === 'PENDING' && (
          <Text style={s.reportedText}>Pagamento informado ao administrador</Text>
        )}
      </View>
      <View style={s.amounts}>
        <Text style={s.amountText}>{formatCurrency(payment.amount)}</Text>
        <Text style={[s.statusText, { color }]}>{statusLabel(payment)}</Text>
        {canPay && (
          <TouchableOpacity style={s.payBtn} onPress={onPay} activeOpacity={0.7}>
            <Text style={s.payBtnText}>Pagar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function ReportRow({
  title, subtitle, paid, pending, overdue,
}: {
  title: string;
  subtitle: string;
  paid: number;
  pending: number;
  overdue: number;
}) {
  return (
    <View style={s.reportRow}>
      <View style={{ flex: 1 }}>
        <Text style={s.rowTitle}>{title}</Text>
        <Text style={s.rowSub}>{subtitle}</Text>
      </View>
      <View style={s.amounts}>
        <Text style={s.paidText}>{formatCurrency(paid)}</Text>
        <Text style={s.pendingText}>{formatCurrency(pending)} pendente</Text>
        {overdue > 0 && <Text style={s.overdueText}>{formatCurrency(overdue)} vencido</Text>}
      </View>
    </View>
  );
}

function PaymentModal({
  payment, isReporting, onClose, onOpenMatch, onReportPayment,
}: {
  payment: AthleteFinancePayment | null;
  isReporting: boolean;
  onClose: () => void;
  onOpenMatch: (payment: AthleteFinancePayment) => void;
  onReportPayment: (payment: AthleteFinancePayment) => void;
}) {
  if (!payment) return null;
  const pix = payment.group?.pixKey ?? payment.group?.adminPixKey ?? 'Pix não cadastrado';
  const canReportPayment = payment.type === 'MONTHLY' && payment.status === 'PENDING';
  return (
    <Modal transparent animationType="slide" visible onRequestClose={onClose}>
      <Pressable style={s.modalOverlay} onPress={onClose}>
        <Pressable style={s.modalSheet} onPress={(event) => event.stopPropagation()}>
          <View style={s.modalHandle} />
          <Text style={s.modalTitle}>Dados para pagamento</Text>
          <InfoLine label="Valor" value={formatCurrency(payment.amount)} />
          <InfoLine label="Grupo" value={payment.group?.name ?? 'Sem grupo'} />
          <InfoLine label="Jogo" value={payment.match ? `${payment.match.location} · ${formatDate(payment.match.date)}` : 'Mensalidade'} />
          <InfoLine label="Administrador" value={payment.group?.adminName ?? 'Administrador do grupo'} />
          <InfoLine label="Pix" value={pix} strong />

          {payment.match?.id && (
            <TouchableOpacity style={s.primaryBtnFull} onPress={() => onOpenMatch(payment)} activeOpacity={0.7}>
              <Ionicons name="football-outline" size={18} color={Colors.white} />
              <Text style={s.primaryBtnText}>Abrir jogo e informar pagamento</Text>
            </TouchableOpacity>
          )}
          {canReportPayment && (
            <TouchableOpacity
              style={[s.primaryBtnFull, isReporting && { opacity: 0.6 }]}
              onPress={() => onReportPayment(payment)}
              disabled={isReporting}
              activeOpacity={0.7}
            >
              <Ionicons name="receipt-outline" size={18} color={Colors.white} />
              <Text style={s.primaryBtnText}>{isReporting ? 'Informando...' : 'Informar pagamento'}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={s.secondaryBtnFull} onPress={onClose} activeOpacity={0.7}>
            <Text style={s.secondaryBtnText}>Fechar</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function InfoLine({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={s.infoLine}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={[s.infoValue, strong && s.infoValueStrong]} selectable>{value}</Text>
    </View>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <View style={s.emptyCard}>
      <Ionicons name="wallet-outline" size={30} color={Colors.n300} />
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
  primaryBtnText:   { color: Colors.white, fontWeight: '800' },
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
  tabText:          { fontSize: 12, fontWeight: '700', color: Colors.n500 },
  tabTextActive:    { color: Colors.primary },
  section:          { paddingHorizontal: Spacing.lg, gap: 8 },
  sectionTitle:     { fontSize: 14, fontWeight: '900', color: Colors.n900, marginBottom: 2 },
  paymentRow:       { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.r12, borderWidth: 1, borderColor: Colors.n200, padding: 12, gap: 10 },
  reportRow:        { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.r12, borderWidth: 1, borderColor: Colors.n200, padding: 12, gap: 10 },
  rowTitle:         { fontSize: 13, fontWeight: '800', color: Colors.n900 },
  rowSub:           { fontSize: 11, color: Colors.n500, marginTop: 3 },
  amounts:          { alignItems: 'flex-end', maxWidth: 132 },
  amountText:       { fontSize: 13, fontWeight: '900', color: Colors.n900 },
  statusText:       { fontSize: 11, fontWeight: '800', marginTop: 2 },
  paidText:         { fontSize: 13, fontWeight: '900', color: Colors.successDark },
  pendingText:      { fontSize: 11, fontWeight: '700', color: Colors.warningDark, marginTop: 2 },
  overdueText:      { fontSize: 11, fontWeight: '700', color: Colors.errorDark, marginTop: 2 },
  reportedText:     { fontSize: 11, fontWeight: '700', color: Colors.warningDark, marginTop: 4 },
  payBtn:           { backgroundColor: Colors.primary, borderRadius: Radius.r8, paddingHorizontal: 10, paddingVertical: 6, marginTop: 6 },
  payBtnText:       { color: Colors.white, fontSize: 11, fontWeight: '800' },
  emptyCard:        { alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.r12, borderWidth: 1, borderColor: Colors.n200, paddingVertical: 24, gap: 8 },
  emptyText:        { fontSize: 13, color: Colors.n500 },
  modalOverlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalSheet:       { backgroundColor: Colors.white, borderTopLeftRadius: Radius.r24, borderTopRightRadius: Radius.r24, padding: Spacing.lg, gap: 10 },
  modalHandle:      { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.n300, alignSelf: 'center', marginBottom: 8 },
  modalTitle:       { fontSize: 18, fontWeight: '900', color: Colors.n900, marginBottom: 4 },
  infoLine:         { borderWidth: 1, borderColor: Colors.n200, borderRadius: Radius.r12, padding: 10, backgroundColor: Colors.n50 },
  infoLabel:        { fontSize: 11, color: Colors.n500, marginBottom: 3 },
  infoValue:        { fontSize: 13, fontWeight: '700', color: Colors.n800 },
  infoValueStrong:  { color: Colors.primary, fontSize: 15 },
  primaryBtnFull:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, borderRadius: Radius.r12, paddingVertical: 13, marginTop: 4 },
  secondaryBtnFull: { alignItems: 'center', backgroundColor: Colors.n100, borderRadius: Radius.r12, paddingVertical: 13 },
  secondaryBtnText: { color: Colors.n700, fontWeight: '800' },
});
