import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useAuthStore } from '@features/auth/useAuthStore';
import { athleteApi } from '@features/athletes/services/athleteApi';
import { AthleteFinancePayment } from '@features/athletes/athleteTypes';
import { AthleteFinanceTab, StatusFilter, TypeFilter } from './types';

export function useAthleteFinanceScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const athleteId = useAuthStore((state) => state.athleteId) ?? '';

  const [tab, setTab] = useState<AthleteFinanceTab>('due');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');
  const [selectedPayment, setSelectedPayment] = useState<AthleteFinancePayment | null>(null);

  const filters = useMemo(() => ({
    ...(statusFilter !== 'ALL' && { status: statusFilter }),
    ...(typeFilter !== 'ALL' && { type: typeFilter }),
  }), [statusFilter, typeFilter]);

  const reportQuery = useQuery({
    queryKey: ['athlete-finance-report', athleteId, filters],
    queryFn: () => athleteApi.financeReport(athleteId, filters),
    enabled: !!athleteId,
    placeholderData: keepPreviousData,
  });

  const reportPaymentMutation = useMutation({
    mutationFn: (transactionId: string) => athleteApi.reportMonthlyPayment(transactionId),
    onSuccess: () => {
      setSelectedPayment(null);
      queryClient.invalidateQueries({ queryKey: ['athlete-finance-report', athleteId] });
      Alert.alert('Pagamento informado', 'O administrador foi avisado para conferir o Pix.');
    },
    onError: () => Alert.alert('Erro', 'Nao foi possivel informar o pagamento.'),
  });

  const openMatch = useCallback((payment: AthleteFinancePayment) => {
    setSelectedPayment(null);
    if (payment.match?.id) {
      router.push({
        pathname: '/matches/match-home',
        params: { matchId: payment.match.id, groupId: payment.group?.id ?? '', isAdmin: '0' },
      } as any);
    }
  }, [router]);

  const reportPayment = useCallback((payment: AthleteFinancePayment) => {
    reportPaymentMutation.mutate(payment.id);
  }, [reportPaymentMutation]);

  return {
    data: reportQuery.data,
    isError: reportQuery.isError,
    isLoading: reportQuery.isLoading,
    isFetching: reportQuery.isFetching,
    isReportingPayment: reportPaymentMutation.isPending,
    refetch: reportQuery.refetch,
    selectedPayment,
    setSelectedPayment,
    setStatusFilter,
    setTab,
    setTypeFilter,
    statusFilter,
    tab,
    typeFilter,
    openMatch,
    reportPayment,
  };
}
