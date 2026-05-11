import { useQuery } from '@tanstack/react-query';
import { httpClient as api } from '../../../lib/httpClient';
import { useAuthStore } from '../../auth/useAuthStore';
import { ProfileData } from '../types/profile.types';

export const useProfileLogic = () => {
  const athleteId = useAuthStore((state) => state.athleteId);
  const logout = useAuthStore((state) => state.logout);

  const { data, isLoading, isError, refetch, isRefetching } = useQuery<ProfileData>({
    queryKey: ['profile', athleteId],
    queryFn: async () => {
      // Executa chamadas em paralelo para montar o perfil sem atrasar a tela
      const [dashboardRes, historyRes] = await Promise.all([
        api.get('/dashboard'),
        api.get(`/athletes/${athleteId}/history`).catch(() => ({ data: [] })), // Fail-safe para o histórico
      ]);

      return {
        id: dashboardRes.data.athlete.id,
        name: dashboardRes.data.athlete.name,
        email: dashboardRes.data.athlete.email || '',
        overall: dashboardRes.data.athlete.overall,
        preferredPosition: dashboardRes.data.athlete.preferredPosition,
        financialDebt: dashboardRes.data.athlete.financialDebt,
        history: historyRes.data,
      };
    },
    enabled: !!athleteId, // Só executa se o ID do usuário estiver disponível
  });

  // Função de logout que será atrelada a um botão na View
  const handleLogout = () => {
    logout();
  };

  return { data, isLoading, isError, refetch, isRefetching, handleLogout };
};