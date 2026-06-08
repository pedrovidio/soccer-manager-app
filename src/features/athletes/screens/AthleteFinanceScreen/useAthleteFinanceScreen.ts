import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useAuthStore } from '@features/auth/useAuthStore';
import { athleteApi } from '@features/athletes/services/athleteApi';
import { matchApi } from '@features/matchmaking/services/matchApi';
import { AthleteFinancePayment, AthleteFinanceType } from '@features/athletes/athleteTypes';
import { queryKeys } from '@lib/queryKeys';
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
    queryKey: queryKeys.athleteFinanceReport(athleteId, filters),
    queryFn: () => athleteApi.financeReport(athleteId, filters),
    enabled: !!athleteId,
    placeholderData: keepPreviousData,
  });

  const reportPaymentMutation = useMutation({
    mutationFn: (payment: AthleteFinancePayment) => {
      if (payment.type === 'SPOT' && payment.match?.id) {
        return matchApi.reportSpotPayment(payment.match.id, athleteId);
      }
      return athleteApi.reportMonthlyPayment(payment.id);
    },
    onSuccess: () => {
      setSelectedPayment(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.athleteFinanceReports(athleteId) });
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
    reportPaymentMutation.mutate(payment);
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
