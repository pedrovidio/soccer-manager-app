import { useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { getFullImageUrl } from '../../../../lib/imageUrl';
import { useAuthStore } from '../../../auth/useAuthStore';
import { useHomeDashboard } from '../../../home/hooks/useHomeDashboard';
import { STATUS_STYLE, overallColor } from './profileData';

export function useProfileScreen() {
  const router = useRouter();
  const athleteId = useAuthStore((state) => state.athleteId) ?? '';
  const authName = useAuthStore((state) => state.name);
  const logout = useAuthStore((state) => state.logout);
  const { dashboard, isLoading } = useHomeDashboard(athleteId);

  const profile = useMemo(() => {
    const name = dashboard?.name ?? authName ?? '-';
    const overall = dashboard?.overall ?? 0;
    const status = dashboard?.status ?? 'Ativo';
    return {
      dashboard,
      name,
      overall,
      position: dashboard?.position ?? '',
      status,
      stats: dashboard?.averageStats,
      initials: name.split(' ').slice(0, 2).map((word: string) => word[0]).join('').toUpperCase(),
      overallColor: overallColor(overall),
      statusStyle: STATUS_STYLE[status] ?? STATUS_STYLE.Ativo,
      photoUrl: getFullImageUrl(dashboard?.photoUrl),
    };
  }, [authName, dashboard]);

  const goEditProfile = useCallback(() => router.push('/athletes/edit-profile' as any), [router]);
  const goGroups = useCallback(() => router.push('/groups' as any), [router]);

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
    goEditProfile,
    goGroups,
    confirmLogout,
  };
}
