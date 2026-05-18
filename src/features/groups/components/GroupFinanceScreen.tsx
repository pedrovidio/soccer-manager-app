import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator, Alert, Modal, Pressable, RefreshControl, SafeAreaView, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { BackButton } from '../../common/components/BackButton';
import { Colors, Radius, Spacing } from '../../common/theme';
import { realtime } from '../../../lib/realtime';
import { useAuthStore } from '../../auth/useAuthStore';
import { groupApi } from '../services/groupApi';
import { GroupFinancePayment, GroupFinanceStatus, GroupFinanceType } from '../groupTypes';
import { GroupTopMenu } from './GroupTopMenu';

type Tab = 'review' | 'overview' | 'matches' | 'defaulters' | 'expenses' | 'payments';
type StatusFilter = 'ALL' | GroupFinanceStatus;
type TypeFilter = 'ALL' | GroupFinanceType;
type ExpenseKind = 'COURT_RENTAL' | 'PURCHASE';

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
  const map: Record<GroupFinanceType, string> = {
    MONTHLY: 'Mensalidade',
    SPOT: 'Avulso',
    COURT_RENTAL: 'Aluguel da quadra',
    PURCHASE: 'Compra',
  };
  return map[type];
}

function isExpenseType(type: GroupFinanceType) {
  return type === 'COURT_RENTAL' || type === 'PURCHASE';
}

export default function GroupFinanceScreen() {
  const { groupId, tab: initialTab } = useLocalSearchParams<{ groupId: string; tab?: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const athleteId = useAuthStore((s) => s.athleteId) ?? '';
  const [tab, setTab] = useState<Tab>(initialTab === 'review' ? 'review' : 'overview');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');
  const [expenseKind, setExpenseKind] = useState<ExpenseKind | null>(null);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');

  const filters = useMemo(() => ({
    ...(statusFilter !== 'ALL' && { status: statusFilter }),
    ...(typeFilter !== 'ALL' && { type: typeFilter }),
  }), [statusFilter, typeFilter]);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['group-finance-report', groupId, athleteId, filters],
    queryFn: () => groupApi.financeReport(groupId!, athleteId, filters),
    enabled: !!groupId && !!athleteId,
    refetchInterval: realtime.financeMs,
  });

  const registerExpenseMutation = useMutation({
    mutationFn: async () => {
      if (!expenseKind || !groupId) return;
      const amount = Number(expenseAmount.replace(/\./g, '').replace(',', '.'));
      if (!Number.isFinite(amount) || amount <= 0) throw new Error('Informe um valor válido.');
      const description = expenseDescription.trim();
      if (expenseKind === 'PURCHASE' && description.length < 3) throw new Error('Informe uma descrição para a compra.');
      const payload = {
        adminId: athleteId,
        amount,
        description: description || (expenseKind === 'COURT_RENTAL' ? 'Aluguel da quadra' : 'Compra do grupo'),
        paidAt: new Date().toISOString(),
      };
      return expenseKind === 'COURT_RENTAL'
        ? groupApi.registerCourtRental(groupId, payload)
        : groupApi.registerPurchase(groupId, payload);
    },
    onSuccess: () => {
      setExpenseKind(null);
      setExpenseAmount('');
      setExpenseDescription('');
      qc.invalidateQueries({ queryKey: ['group-finance-report', groupId] });
      qc.invalidateQueries({ queryKey: ['group-home', groupId] });
    },
    onError: (error: any) => Alert.alert('Erro', error?.message ?? 'Não foi possível registrar a saída.'),
  });

  const confirmPaymentMutation = useMutation({
    mutationFn: (payment: GroupFinancePayment) =>
      payment.type === 'MONTHLY'
        ? groupApi.confirmMonthlyPayment(payment.id)
        : groupApi.confirmSpotPayment(payment.id),
    onSuccess: (_result, payment) => {
      qc.invalidateQueries({ queryKey: ['group-finance-report', groupId] });
      qc.invalidateQueries({ queryKey: ['group-home', groupId] });
      qc.invalidateQueries({ queryKey: ['athlete-finance-report', payment.athleteId] });
      qc.invalidateQueries({ queryKey: ['dashboard', payment.athleteId] });
    },
    onError: () => Alert.alert('Erro', 'Não foi possível confirmar o pagamento.'),
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
        <Ionicons name="alert-circle-outline" size={42} color={Colors.error} />
        <Text style={s.errorText}>{isForbidden ? 'Você não tem acesso a este grupo' : 'Erro ao carregar financeiro'}</Text>
        <TouchableOpacity style={s.primaryBtn} onPress={() => (isForbidden ? router.back() : refetch())}>
          <Text style={s.primaryBtnText}>{isForbidden ? 'Voltar' : 'Tentar novamente'}</Text>
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

      <GroupTopMenu groupId={groupId!} active="finance" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} colors={[Colors.primary]} />}
      >
        <View style={s.summaryGrid}>
          <MetricCard label="Em caixa" value={formatCurrency(data.summary.cashInHand)} tone="success" />
          <MetricCard label="Despesas" value={formatCurrency(data.summary.totalExpenses)} tone="error" />
          <MetricCard label="A receber" value={formatCurrency(data.summary.totalPending)} tone="warning" />
          <MetricCard label="Vencido" value={formatCurrency(data.summary.totalOverdue)} tone="error" />
        </View>

        <View style={s.actions}>
          <TouchableOpacity style={s.actionBtn} onPress={() => setExpenseKind('COURT_RENTAL')} activeOpacity={0.7}>
            <Ionicons name="business-outline" size={18} color={Colors.primary} />
            <Text style={s.actionText}>Pagar quadra</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.actionBtn} onPress={() => setExpenseKind('PURCHASE')} activeOpacity={0.7}>
            <Ionicons name="cart-outline" size={18} color={Colors.primary} />
            <Text style={s.actionText}>Registrar compra</Text>
          </TouchableOpacity>
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
            <Chip label="Todos tipos" active={typeFilter === 'ALL'} onPress={() => setTypeFilter('ALL')} />
            <Chip label="Avulsos" active={typeFilter === 'SPOT'} onPress={() => setTypeFilter('SPOT')} />
            <Chip label="Mensalidades" active={typeFilter === 'MONTHLY'} onPress={() => setTypeFilter('MONTHLY')} />
            <Chip label="Quadra" active={typeFilter === 'COURT_RENTAL'} onPress={() => setTypeFilter('COURT_RENTAL')} />
            <Chip label="Compras" active={typeFilter === 'PURCHASE'} onPress={() => setTypeFilter('PURCHASE')} />
          </ScrollView>
        </View>

        <View style={s.tabs}>
          <TabButton label="Conferir" active={tab === 'review'} onPress={() => setTab('review')} />
          <TabButton label="Resumo" active={tab === 'overview'} onPress={() => setTab('overview')} />
          <TabButton label="Jogos" active={tab === 'matches'} onPress={() => setTab('matches')} />
          <TabButton label="Inadimpl." active={tab === 'defaulters'} onPress={() => setTab('defaulters')} />
          <TabButton label="Saídas" active={tab === 'expenses'} onPress={() => setTab('expenses')} />
          <TabButton label="Tudo" active={tab === 'payments'} onPress={() => setTab('payments')} />
        </View>

        {tab === 'review' && (
          <PaymentList
            title="Pagamentos para conferir"
            empty="Nenhum pagamento informado aguardando conferência"
            payments={reportedPayments}
            onConfirm={(payment) => confirmPaymentMutation.mutate(payment)}
            confirmingId={confirmPaymentMutation.variables?.id}
          />
        )}

        {tab === 'overview' && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Movimentação por tipo</Text>
            {data.byType.map((item) => (
              <View key={item.type} style={s.reportRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.rowTitle}>{typeLabel(item.type)}</Text>
                  <Text style={s.rowSub}>{item.count} lançamento(s)</Text>
                </View>
                <View style={s.amounts}>
                  <Text style={isExpenseType(item.type) ? s.expenseValue : s.paidText}>
                    {isExpenseType(item.type) ? '-' : ''}{formatCurrency(item.paid)}
                  </Text>
                  {!isExpenseType(item.type) && <Text style={s.pendingText}>{formatCurrency(item.pending)} pendente</Text>}
                </View>
              </View>
            ))}

            <Text style={[s.sectionTitle, { marginTop: 18 }]}>Alertas</Text>
            <AlertLine icon="time-outline" label="Pagamentos vencidos" value={`${overduePayments.length}`} tone="error" />
            <AlertLine icon="receipt-outline" label="Pagamentos informados aguardando conferência" value={`${reportedPayments.length}`} tone="warning" />
            <AlertLine icon="trending-down-outline" label="Saídas de caixa registradas" value={formatCurrency(data.summary.totalExpenses)} tone="error" />
            <AlertLine icon="wallet-outline" label="Total previsto de receitas" value={formatCurrency(data.summary.expectedTotal)} tone="neutral" />
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
                  <Text style={s.rowSub}>{formatDate(match.matchDate)} - {match.transactionCount} cobrança(s)</Text>
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
          <PaymentList title="Inadimplentes e pendências" empty="Nenhum pagamento pendente" payments={data.defaulters} onConfirm={(payment) => confirmPaymentMutation.mutate(payment)} confirmingId={confirmPaymentMutation.variables?.id} />
        )}

        {tab === 'expenses' && (
          <PaymentList title="Saídas de caixa" empty="Nenhuma despesa registrada" payments={data.expenses} onConfirm={(payment) => confirmPaymentMutation.mutate(payment)} confirmingId={confirmPaymentMutation.variables?.id} />
        )}

        {tab === 'payments' && (
          <PaymentList title="Todos os lançamentos" empty="Nenhum lançamento encontrado" payments={data.payments} onConfirm={(payment) => confirmPaymentMutation.mutate(payment)} confirmingId={confirmPaymentMutation.variables?.id} />
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      <ExpenseModal
        kind={expenseKind}
        amount={expenseAmount}
        description={expenseDescription}
        isSaving={registerExpenseMutation.isPending}
        onAmountChange={setExpenseAmount}
        onDescriptionChange={setExpenseDescription}
        onClose={() => setExpenseKind(null)}
        onSave={() => registerExpenseMutation.mutate()}
      />
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

function PaymentList({
  title, empty, payments, onConfirm, confirmingId,
}: {
  title: string;
  empty: string;
  payments: GroupFinancePayment[];
  onConfirm: (payment: GroupFinancePayment) => void;
  confirmingId?: string;
}) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      {payments.length === 0 ? (
        <EmptyState text={empty} />
      ) : payments.map((payment) => (
        <PaymentRow key={payment.id} payment={payment} onConfirm={() => onConfirm(payment)} isConfirming={confirmingId === payment.id} />
      ))}
    </View>
  );
}

function PaymentRow({ payment, onConfirm, isConfirming }: { payment: GroupFinancePayment; onConfirm: () => void; isConfirming: boolean }) {
  const isExpense = isExpenseType(payment.type);
  const statusTone = payment.status === 'PAID' ? Colors.successDark : payment.isOverdue ? Colors.errorDark : Colors.warningDark;
  const canConfirm = !isExpense && payment.status === 'PENDING' && !!payment.paymentReportedAt;
  return (
    <View style={s.paymentRow}>
      <View style={{ flex: 1 }}>
        <Text style={s.rowTitle} numberOfLines={1}>{isExpense ? typeLabel(payment.type) : payment.athleteName}</Text>
        <Text style={s.rowSub} numberOfLines={1}>
          {isExpense
            ? `${payment.description ?? 'Sem descrição'} - ${formatDate(payment.createdAt)}`
            : `${typeLabel(payment.type)} - ${payment.matchLocation ?? 'Sem partida'} - vence ${formatDate(payment.dueDate)}`}
        </Text>
        {payment.paymentReportedAt && payment.status === 'PENDING' && (
          <Text style={s.reportedText}>Informado em {formatDate(payment.paymentReportedAt)}, aguardando confirmação</Text>
        )}
      </View>
      <View style={s.amounts}>
        <Text style={[s.amountText, isExpense && s.expenseText]}>{isExpense ? '-' : ''}{formatCurrency(payment.amount)}</Text>
        <Text style={[s.statusText, { color: statusTone }]}>
          {payment.isOverdue ? 'Vencido' : statusLabel(payment.status)}
        </Text>
        {canConfirm && (
          <TouchableOpacity style={[s.confirmBtn, isConfirming && { opacity: 0.6 }]} onPress={onConfirm} disabled={isConfirming} activeOpacity={0.7}>
            <Text style={s.confirmBtnText}>{isConfirming ? 'Confirmando...' : 'Confirmar'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function ExpenseModal({
  kind, amount, description, isSaving, onAmountChange, onDescriptionChange, onClose, onSave,
}: {
  kind: ExpenseKind | null;
  amount: string;
  description: string;
  isSaving: boolean;
  onAmountChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  if (!kind) return null;
  const isPurchase = kind === 'PURCHASE';
  return (
    <Modal transparent animationType="slide" visible onRequestClose={onClose}>
      <Pressable style={s.modalOverlay} onPress={onClose}>
        <Pressable style={s.modalSheet} onPress={(event) => event.stopPropagation()}>
          <View style={s.modalHandle} />
          <Text style={s.modalTitle}>{isPurchase ? 'Registrar compra' : 'Pagamento da quadra'}</Text>
          <Text style={s.inputLabel}>Valor pago</Text>
          <TextInput
            style={s.input}
            value={amount}
            onChangeText={onAmountChange}
            keyboardType="decimal-pad"
            placeholder="0,00"
            placeholderTextColor={Colors.n400}
          />
          <Text style={s.inputLabel}>Descrição</Text>
          <TextInput
            style={[s.input, s.textArea]}
            value={description}
            onChangeText={onDescriptionChange}
            placeholder={isPurchase ? 'Ex: bola nova, uniformes...' : 'Ex: aluguel da quadra de maio'}
            placeholderTextColor={Colors.n400}
            multiline
          />
          <TouchableOpacity style={[s.saveBtn, isSaving && { opacity: 0.6 }]} onPress={onSave} disabled={isSaving} activeOpacity={0.7}>
            <Text style={s.saveBtnText}>{isSaving ? 'Salvando...' : 'Registrar saída'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.cancelBtn} onPress={onClose} activeOpacity={0.7}>
            <Text style={s.cancelBtnText}>Cancelar</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
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
  actions:          { flexDirection: 'row', gap: 10, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md },
  actionBtn:        { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: Colors.white, borderRadius: Radius.r12, borderWidth: 1, borderColor: Colors.n200, paddingVertical: 12 },
  actionText:       { fontSize: 12, fontWeight: '800', color: Colors.primary },
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
  tabText:          { fontSize: 10, fontWeight: '700', color: Colors.n500 },
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
  expenseText:      { color: Colors.errorDark },
  expenseValue:     { fontSize: 13, fontWeight: '900', color: Colors.errorDark },
  statusText:       { fontSize: 11, fontWeight: '800', marginTop: 2 },
  confirmBtn:       { backgroundColor: Colors.primary, borderRadius: Radius.r8, paddingHorizontal: 10, paddingVertical: 6, marginTop: 6 },
  confirmBtnText:   { color: Colors.white, fontSize: 11, fontWeight: '800' },
  reportedText:     { fontSize: 11, fontWeight: '700', color: Colors.warningDark, marginTop: 4 },
  alertLine:        { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.r12, borderWidth: 1, borderColor: Colors.n200, padding: 12, gap: 8 },
  alertLabel:       { flex: 1, fontSize: 12, fontWeight: '700', color: Colors.n700 },
  alertValue:       { fontSize: 13, fontWeight: '900' },
  emptyCard:        { alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.r12, borderWidth: 1, borderColor: Colors.n200, paddingVertical: 24, gap: 8 },
  emptyText:        { fontSize: 13, color: Colors.n500 },
  modalOverlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalSheet:       { backgroundColor: Colors.white, borderTopLeftRadius: Radius.r24, borderTopRightRadius: Radius.r24, padding: Spacing.lg, gap: 8 },
  modalHandle:      { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.n300, alignSelf: 'center', marginBottom: 8 },
  modalTitle:       { fontSize: 18, fontWeight: '900', color: Colors.n900, marginBottom: 6 },
  inputLabel:       { fontSize: 12, fontWeight: '800', color: Colors.n700 },
  input:            { borderWidth: 1, borderColor: Colors.n200, backgroundColor: Colors.n50, borderRadius: Radius.r12, paddingHorizontal: 12, paddingVertical: 11, color: Colors.n900, fontWeight: '700' },
  textArea:         { minHeight: 82, textAlignVertical: 'top' },
  saveBtn:          { backgroundColor: Colors.primary, borderRadius: Radius.r12, paddingVertical: 13, alignItems: 'center', marginTop: 6 },
  saveBtnText:      { color: Colors.white, fontWeight: '900' },
  cancelBtn:        { backgroundColor: Colors.n100, borderRadius: Radius.r12, paddingVertical: 13, alignItems: 'center' },
  cancelBtnText:    { color: Colors.n700, fontWeight: '800' },
});
