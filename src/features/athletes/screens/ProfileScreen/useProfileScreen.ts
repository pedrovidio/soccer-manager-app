import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { getFullImageUrl } from '@lib/imageUrl';
import { queryKeys } from '@lib/queryKeys';
import { useAuthStore } from '@features/auth/useAuthStore';
import { useHomeDashboard } from '@features/home/hooks/useHomeDashboard';
import { rankingApi } from '@features/ranking/services/rankingApi';
import { getInitials } from '@ui/utils/avatar';
import { athleteApi } from '../../services/athleteApi';
import { STATUS_STYLE, overallColor } from './profileData';

const DELETE_CONFIRMATION_TEXT = 'EXCLUIR';

export function useProfileScreen() {
  const router = useRouter();
  const athleteId = useAuthStore((state) => state.athleteId) ?? '';
  const authName = useAuthStore((state) => state.name);
  const logout = useAuthStore((state) => state.logout);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeletingAccount, setDeletingAccount] = useState(false);
  const { dashboard, isLoading } = useHomeDashboard(athleteId);
  const rankingSummaryQuery = useQuery({
    queryKey: queryKeys.rankingMe(athleteId),
    queryFn: rankingApi.mySummary,
    enabled: !!athleteId,
  });

  const profile = useMemo(() => {
    const name = dashboard?.name ?? authName ?? '-';
    const overall = dashboard?.overall ?? 0;
    const status = dashboard?.status ?? 'Ativo';
    return {
      dashboard,
      name,
      overall,
      position: dashboard?.position ?? '',
      plan: dashboard?.plan ?? 'FREE',
      status,
      stats: dashboard?.averageStats,
      initials: getInitials(name),
      overallColor: overallColor(overall),
      statusStyle: STATUS_STYLE[status] ?? STATUS_STYLE.Ativo,
      photoUrl: getFullImageUrl(dashboard?.photoUrl),
    };
  }, [authName, dashboard]);

  const goEditProfile = useCallback(() => router.push('/athletes/edit-profile' as any), [router]);
  const goGroups = useCallback(() => router.push('/groups' as any), [router]);
  const canDeleteAccount = deleteConfirmation.trim() === DELETE_CONFIRMATION_TEXT;

  const openDeleteAccountModal = useCallback(() => {
    setDeleteConfirmation('');
    setDeleteModalVisible(true);
  }, []);

  const closeDeleteAccountModal = useCallback(() => {
    if (isDeletingAccount) return;
    setDeleteConfirmation('');
    setDeleteModalVisible(false);
  }, [isDeletingAccount]);

  const deleteAccount = useCallback(async () => {
    if (!canDeleteAccount || isDeletingAccount) return;

    setDeletingAccount(true);
    try {
      await athleteApi.deleteAccount();
      await logout().catch(() => null);
      setDeleteModalVisible(false);
      router.replace('/login');
    } catch (error) {
      Alert.alert(
        'Nao foi possivel excluir',
        'Tente novamente em alguns instantes. Se o erro continuar, entre em contato com o suporte.',
      );
    } finally {
      setDeletingAccount(false);
    }
  }, [canDeleteAccount, isDeletingAccount, logout, router]);

  const confirmLogout = useCallback(() => {
    Alert.alert('Sair', 'Deseja encerrar sua sessao?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
  }, [logout, router]);

  return {
    isLoading,
    profile,
    rankingSummary: rankingSummaryQuery.data ?? { rankGlobal: 0, points: 0, goals: 0 },
    isRankingLoading: rankingSummaryQuery.isLoading,
    deleteAccountState: {
      confirmationText: DELETE_CONFIRMATION_TEXT,
      isModalVisible: isDeleteModalVisible,
      typedConfirmation: deleteConfirmation,
      canConfirm: canDeleteAccount,
      isDeleting: isDeletingAccount,
    },
    goEditProfile,
    goGroups,
    confirmLogout,
    openDeleteAccountModal,
    closeDeleteAccountModal,
    setDeleteConfirmation,
    deleteAccount,
  };
}
