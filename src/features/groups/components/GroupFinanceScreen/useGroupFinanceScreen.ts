import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../auth/useAuthStore';
import { GroupFinancePayment } from '../../groupTypes';
import { groupApi } from '../../services/groupApi';
import { parseMoneyInput } from '../../utils/financeFormatters';
import { ExpenseKind, FinanceTab, StatusFilter, TypeFilter } from './types';

export function useGroupFinanceScreen() {
  const { groupId, tab: initialTab } = useLocalSearchParams<{ groupId: string; tab?: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const athleteId = useAuthStore((state) => state.athleteId) ?? '';

  const [tab, setTab] = useState<FinanceTab>(initialTab === 'review' ? 'review' : 'overview');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');
  const [expenseKind, setExpenseKind] = useState<ExpenseKind | null>(null);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');

  const filters = useMemo(() => ({
    ...(statusFilter !== 'ALL' && { status: statusFilter }),
    ...(typeFilter !== 'ALL' && { type: typeFilter }),
  }), [statusFilter, typeFilter]);

  const reportQuery = useQuery({
    queryKey: ['group-finance-report', groupId, athleteId, filters],
    queryFn: () => groupApi.financeReport(groupId!, athleteId, filters),
    enabled: !!groupId && !!athleteId,
  });

  const invalidateFinance = useCallback((payment?: GroupFinancePayment) => {
    queryClient.invalidateQueries({ queryKey: ['group-finance-report', groupId] });
    queryClient.invalidateQueries({ queryKey: ['group-home', groupId] });
    if (payment) {
      queryClient.invalidateQueries({ queryKey: ['athlete-finance-report', payment.athleteId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', payment.athleteId] });
    }
  }, [groupId, queryClient]);

  const closeExpenseModal = useCallback(() => setExpenseKind(null), []);

  const registerExpenseMutation = useMutation({
    mutationFn: async () => {
      if (!expenseKind || !groupId) return;
      const amount = parseMoneyInput(expenseAmount);
      if (!Number.isFinite(amount) || amount <= 0) throw new Error('Informe um valor valido.');

      const description = expenseDescription.trim();
      if (expenseKind === 'PURCHASE' && description.length < 3) throw new Error('Informe uma descricao para a compra.');

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
      invalidateFinance();
    },
    onError: (error: any) => Alert.alert('Erro', error?.message ?? 'Nao foi possivel registrar a saida.'),
  });

  const confirmPaymentMutation = useMutation({
    mutationFn: (payment: GroupFinancePayment) =>
      payment.type === 'MONTHLY'
        ? groupApi.confirmMonthlyPayment(payment.id)
        : groupApi.confirmSpotPayment(payment.id),
    onSuccess: (_result, payment) => invalidateFinance(payment),
    onError: () => Alert.alert('Erro', 'Nao foi possivel confirmar o pagamento.'),
  });

  const reportedPayments = useMemo(
    () => reportQuery.data?.payments.filter((payment) => payment.status === 'PENDING' && payment.paymentReportedAt) ?? [],
    [reportQuery.data?.payments],
  );

  const overduePayments = useMemo(
    () => reportQuery.data?.defaulters.filter((payment) => payment.isOverdue) ?? [],
    [reportQuery.data?.defaulters],
  );

  return {
    athleteId,
    confirmPayment: confirmPaymentMutation.mutate,
    confirmingId: confirmPaymentMutation.variables?.id,
    data: reportQuery.data,
    error: reportQuery.error,
    expenseAmount,
    expenseDescription,
    expenseKind,
    groupId,
    isError: reportQuery.isError,
    isLoading: reportQuery.isLoading,
    isRegisteringExpense: registerExpenseMutation.isPending,
    overduePayments,
    refetch: reportQuery.refetch,
    registerExpense: registerExpenseMutation.mutate,
    reportedPayments,
    router,
    setExpenseAmount,
    setExpenseDescription,
    setExpenseKind,
    closeExpenseModal,
    setStatusFilter,
    setTab,
    setTypeFilter,
    statusFilter,
    tab,
    typeFilter,
  };
}
