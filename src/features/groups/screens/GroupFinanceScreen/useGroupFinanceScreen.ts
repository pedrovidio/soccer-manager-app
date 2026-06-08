import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useAuthStore } from '@features/auth/useAuthStore';
import { GroupFinancePayment } from '@features/groups/groupTypes';
import { groupApi } from '@features/groups/services/groupApi';
import { parseMoneyInput } from '@features/groups/utils/financeFormatters';
import { queryKeys } from '@lib/queryKeys';
import { ExpenseKind, FinanceTab, StatusFilter, TypeFilter } from './types';

const INITIAL_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

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
  const [pageSize, setPageSize] = useState(INITIAL_PAGE_SIZE);

  const filters = useMemo(() => ({
    ...(statusFilter !== 'ALL' && { status: statusFilter }),
    ...(typeFilter !== 'ALL' && { type: typeFilter }),
  }), [statusFilter, typeFilter]);

  useEffect(() => {
    setPageSize(INITIAL_PAGE_SIZE);
  }, [filters]);

  const reportQuery = useQuery({
    queryKey: groupId ? queryKeys.groupFinanceReport(groupId, athleteId, filters, pageSize) : queryKeys.groupFinanceReportsAll(),
    queryFn: () => groupApi.financeReport(groupId!, athleteId, { ...filters, page: 1, pageSize }),
    enabled: !!groupId && !!athleteId,
    placeholderData: keepPreviousData,
  });

  const invalidateFinance = useCallback((payment?: GroupFinancePayment) => {
    if (groupId) queryClient.invalidateQueries({ queryKey: queryKeys.groupFinanceReports(groupId) });
    if (groupId) queryClient.invalidateQueries({ queryKey: queryKeys.groupHome(groupId) });
    if (payment) {
      queryClient.invalidateQueries({ queryKey: queryKeys.athleteFinanceReports(payment.athleteId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.home(payment.athleteId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(payment.athleteId) });
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
  const isCourtRentalPaid = useMemo(() => {
    const now = new Date();
    return reportQuery.data?.expenses.some((payment) => {
      if (payment.type !== 'COURT_RENTAL' || payment.status !== 'PAID') return false;
      const date = new Date(payment.createdAt);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }) ?? false;
  }, [reportQuery.data?.expenses]);

  const loadMore = useCallback(() => {
    setPageSize((current) => Math.min(current + INITIAL_PAGE_SIZE, MAX_PAGE_SIZE));
  }, []);

  const paginationForTab = useMemo(() => {
    if (!reportQuery.data?.pagination) return null;
    if (tab === 'expenses') return reportQuery.data.pagination.expenses;
    if (tab === 'defaulters') return reportQuery.data.pagination.defaulters;
    if (tab === 'payments' || tab === 'review') return reportQuery.data.pagination.payments;
    return null;
  }, [reportQuery.data?.pagination, tab]);

  const canLoadMore = !!paginationForTab && pageSize < Math.min(paginationForTab.total, MAX_PAGE_SIZE);

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
    isFetching: reportQuery.isFetching,
    isCourtRentalPaid,
    isRegisteringExpense: registerExpenseMutation.isPending,
    canLoadMore,
    loadMore,
    overduePayments,
    paginationForTab,
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
