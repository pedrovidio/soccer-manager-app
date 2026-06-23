import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { getFullImageUrl } from '@lib/imageUrl';
import { queryKeys } from '@lib/queryKeys';
import { useAuthStore } from '@features/auth/useAuthStore';
import { useHomeDashboard } from '@features/home/hooks/useHomeDashboard';
import { rankingApi } from '@features/ranking/services/rankingApi';
import { getInitials } from '@ui/utils/avatar';
import { athleteApi } from '../../services/athleteApi';
import { adService } from '../../services/adService';
import { STATUS_STYLE, overallColor } from './profileData';

const DELETE_CONFIRMATION_TEXT = 'EXCLUIR';

export function useProfileScreen() {
  const router = useRouter();
  const athleteId = useAuthStore((state) => state.athleteId) ?? '';
  const authName = useAuthStore((state) => state.name);
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeletingAccount, setDeletingAccount] = useState(false);
  const [isPromoting, setIsPromoting] = useState(false);
  const [showSimulatedAd, setShowSimulatedAd] = useState(false);
  const [adCountdown, setAdCountdown] = useState(3);
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

  const lastFeaturedAt = dashboard?.lastFeaturedAt ?? null;
  const plan = dashboard?.plan ?? 'FREE';
  const planExpiresAt = dashboard?.planExpiresAt ?? null;

  const now = new Date();
  const isCurrentlyFeatured = plan === 'PREMIUM' && planExpiresAt && new Date(planExpiresAt) > now;

  let canPromote = plan === 'FREE';
  let daysUntilNextPromotion = 0;
  let nextPromotionDate: Date | null = null;

  if (lastFeaturedAt) {
    const lastDate = new Date(lastFeaturedAt);
    nextPromotionDate = new Date(lastDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    if (now < nextPromotionDate) {
      canPromote = false;
      const diffMs = nextPromotionDate.getTime() - now.getTime();
      daysUntilNextPromotion = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
    }
  }

  const promoteProfile = useCallback(async () => {
    console.log('[ProfileScreen] promoteProfile acionado. canPromote:', canPromote, 'isPromoting:', isPromoting, 'athleteId:', athleteId);
    if (!canPromote || isPromoting) {
      console.log('[ProfileScreen] promoteProfile ignorado ou bloqueado.');
      return;
    }
    setIsPromoting(true);

    try {
      console.log('[ProfileScreen] Chamando adService.showRewardedAd...');
      const adResult = await adService.showRewardedAd({
        onEarnReward: async () => {
          console.log('[ProfileScreen] onEarnReward disparado');
          try {
            const result = await athleteApi.promoteFeatured(athleteId);
            console.log('[ProfileScreen] API promoteFeatured retorno:', result);
            if (result.success) {
              queryClient.invalidateQueries({ queryKey: queryKeys.home(athleteId) });
              Alert.alert('Sucesso!', 'Seu perfil foi destacado por 24 horas! 🚀');
            }
          } catch (error: any) {
            console.error('[ProfileScreen] Erro na API promoteFeatured:', error);
            Alert.alert('Erro', error?.response?.data?.error || 'Não foi possível impulsionar seu perfil.');
          } finally {
            setIsPromoting(false);
          }
        },
        onError: (err) => {
          console.error('[ProfileScreen] Erro no adService:', err);
          Alert.alert('Erro', 'Não foi possível carregar o anúncio.');
          setIsPromoting(false);
        }
      });

      console.log('[ProfileScreen] adResult recebido:', adResult);

      if (adResult?.isSimulated) {
        console.log('[ProfileScreen] O anúncio é simulado. Exibindo modal do simulador...');
        setShowSimulatedAd(true);
        setAdCountdown(3);
        const timer = setInterval(() => {
          setAdCountdown((prev) => {
            console.log('[ProfileScreen] Contador do anúncio simulado:', prev - 1);
            if (prev <= 1) {
              clearInterval(timer);
              setShowSimulatedAd(false);
              console.log('[ProfileScreen] Tempo esgotado do simulador. Chamando endpoint do backend...');
              athleteApi.promoteFeatured(athleteId).then((res) => {
                console.log('[ProfileScreen] Sucesso na promoção simulada:', res);
                queryClient.invalidateQueries({ queryKey: queryKeys.home(athleteId) });
                Alert.alert('Sucesso!', 'Seu perfil foi destacado por 24 horas! 🚀');
              }).catch((error) => {
                console.error('[ProfileScreen] Erro na promoção simulada:', error);
                Alert.alert('Erro', error?.response?.data?.error || 'Não foi possível destacar seu perfil.');
              }).finally(() => {
                setIsPromoting(false);
              });
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (e: any) {
      console.error('[ProfileScreen] Exceção capturada no fluxo principal do promoteProfile:', e);
      Alert.alert('Erro inesperado', e?.message || 'Ocorreu um erro ao processar o anúncio.');
      setIsPromoting(false);
    }
  }, [canPromote, isPromoting, athleteId, queryClient]);

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
    promoteProfile,
    promotionInfo: {
      isPromoting,
      showSimulatedAd,
      adCountdown,
      canPromote,
      isCurrentlyFeatured,
      daysUntilNextPromotion,
      nextPromotionDate,
    },
  };
}
