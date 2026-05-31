import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@features/auth/useAuthStore';
import { groupApi } from '@features/groups/services/groupApi';
import { deriveMatchPhase, minimumConfirmedFor } from '../utils/matchPhase';
import { formatDateTime } from '../utils/formatters';
import { matchApi } from '../services/matchApi';
import { Gender, GuestSlotConfig, NearbyAthlete, PresenceStatus, SpotApplication } from '../types';
import { useDebouncedGuestConfig } from './useDebouncedGuestConfig';

export type PresenceFilter = 'ALL' | PresenceStatus;

export function useMatchHomeController() {
  const router = useRouter();
  const qc = useQueryClient();
  const { matchId, groupId, isAdmin: isAdminParam } = useLocalSearchParams<{ matchId: string; groupId: string; isAdmin: string }>();
  const athleteId = useAuthStore((state) => state.athleteId) ?? '';
  const isAdmin = isAdminParam === '1';

  const [guestOpen, setGuestOpen] = useState(false);
  const [guestVacancies, setGuestVacancies] = useState<number>(2);
  const [minAge, setMinAge] = useState<number>(16);
  const [maxAge, setMaxAge] = useState<number>(50);
  const [gender, setGender] = useState<Gender>('ANY');
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [minOverall, setMinOverall] = useState<number>(0);
  const [nameSearch, setNameSearch] = useState('');
  const [selectedSpotAthleteIds, setSelectedSpotAthleteIds] = useState<string[]>([]);
  const [finishModalVisible, setFinishModalVisible] = useState(false);
  const [finishComment, setFinishComment] = useState('');
  const [presenceFilter, setPresenceFilter] = useState<PresenceFilter>('ALL');
  const [scoreA, setScoreA] = useState('');
  const [scoreB, setScoreB] = useState('');
  const [ratingStars, setRatingStars] = useState<Record<string, number>>({});
  const [savedRatingStars, setSavedRatingStars] = useState<Record<string, number>>({});

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['match-detail', matchId],
    queryFn: () => matchApi.getDetail(matchId!, athleteId),
    enabled: !!matchId,
  });

  const { data: spotApplications = [] } = useQuery<SpotApplication[]>({
    queryKey: ['spot-applications', matchId],
    queryFn: () => matchApi.listSpotApplications(matchId!),
    enabled: !!matchId && isAdmin && data?.status !== 'FINISHED',
  });

  useEffect(() => {
    const [firstScore, secondScore] = data?.score?.scores ?? [];
    setScoreA(firstScore !== undefined ? String(firstScore.goals) : '');
    setScoreB(secondScore !== undefined ? String(secondScore.goals) : '');
  }, [data?.score]);

  useEffect(() => {
    const ratings = data?.myRatings ?? {};
    setSavedRatingStars(ratings);
    setRatingStars(ratings);
  }, [data?.myRatings]);

  const debouncedConfig = useDebouncedGuestConfig({ radiusKm, minAge, maxAge, gender, minOverall });

  const { data: allAthletes = [] } = useQuery<NearbyAthlete[]>({
    queryKey: ['nearby-athletes-all', matchId, debouncedConfig],
    queryFn: async () => {
      const result = await matchApi.nearbyAthletes(matchId!, {
        spotRadiusKm: debouncedConfig.radiusKm,
        minAge: debouncedConfig.minAge,
        maxAge: debouncedConfig.maxAge,
        gender: debouncedConfig.gender,
        minOverall: debouncedConfig.minOverall,
      });
      return Array.isArray(result) ? result : [];
    },
    enabled: !!matchId && guestOpen,
    staleTime: 30_000,
  });

  const nearby = useMemo(() => allAthletes.filter((athlete) => {
    if (athlete.overall < debouncedConfig.minOverall) return false;
    if (athlete.age < debouncedConfig.minAge || athlete.age > debouncedConfig.maxAge) return false;
    if (debouncedConfig.gender !== 'ANY' && athlete.gender !== debouncedConfig.gender) return false;
    if (nameSearch.trim() && !athlete.name.toLowerCase().includes(nameSearch.trim().toLowerCase())) return false;
    return true;
  }), [allAthletes, debouncedConfig, nameSearch]);

  const nearbyIds = useMemo(() => new Set(nearby.map((athlete) => athlete.id)), [nearby]);
  const selectedVisibleAthleteIds = useMemo(
    () => selectedSpotAthleteIds.filter((id) => nearbyIds.has(id)),
    [nearbyIds, selectedSpotAthleteIds],
  );
  const selectedVisibleCount = selectedVisibleAthleteIds.length;
  const selectedSpotAthletesCount = selectedSpotAthleteIds.length;

  const guestConfig: GuestSlotConfig = useMemo(() => ({
    guestVacancies: guestVacancies || 2,
    minAge: minAge || 16,
    maxAge: maxAge || 50,
    gender,
    spotRadiusKm: radiusKm || 10,
    minOverall: minOverall || 0,
  }), [gender, guestVacancies, maxAge, minAge, minOverall, radiusKm]);

  const openGuestMutation = useMutation({
    mutationFn: () => matchApi.openGuestSlots(matchId!, athleteId, guestConfig, selectedSpotAthleteIds),
    onSuccess: (result: any) => {
      setSelectedSpotAthleteIds([]);
      qc.invalidateQueries({ queryKey: ['match-detail', matchId] });
      qc.invalidateQueries({ queryKey: ['nearby-athletes-all', matchId] });
      const sent = result?.spotInvitesSent ?? selectedSpotAthletesCount;
      const plural = sent !== 1;
      Alert.alert('Convites enviados', `${sent} atleta${plural ? 's' : ''} selecionado${plural ? 's' : ''} receber${plural ? 'ao' : 'a'} o convite.`);
    },
    onError: () => Alert.alert('Erro', 'Nao foi possivel abrir as vagas.'),
  });

  const toggleSpotSelection = useCallback((targetAthleteId: string) => {
    setSelectedSpotAthleteIds((current) =>
      current.includes(targetAthleteId)
        ? current.filter((id) => id !== targetAthleteId)
        : [...current, targetAthleteId],
    );
  }, []);

  const toggleFavoriteMutation = useMutation({
    mutationFn: (athlete: NearbyAthlete) =>
      athlete.isFavorite
        ? groupApi.unfavoriteSpotAthlete(groupId!, athleteId, athlete.id)
        : groupApi.favoriteSpotAthlete(groupId!, athleteId, athlete.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['nearby-athletes-all', matchId] });
      qc.invalidateQueries({ queryKey: ['favorite-spot-athletes', groupId] });
    },
    onError: () => Alert.alert('Erro', 'Nao foi possivel atualizar o favorito.'),
  });

  const closeGuestMutation = useMutation({
    mutationFn: () => matchApi.closeGuestSlots(matchId!, athleteId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['match-detail', matchId] }),
    onError: () => Alert.alert('Erro', 'Nao foi possivel fechar as vagas.'),
  });

  const finishMatchMutation = useMutation({
    mutationFn: () => matchApi.finishMatch(matchId!, athleteId, finishComment || undefined),
    onSuccess: () => {
      setFinishModalVisible(false);
      setFinishComment('');
      qc.invalidateQueries({ queryKey: ['match-detail', matchId] });
      Alert.alert('Sucesso', 'Jogo finalizado com sucesso');
      refetch();
    },
    onError: (error: any) => Alert.alert('Erro', error?.response?.data?.error || 'Nao foi possivel finalizar o jogo'),
  });

  const reportSpotPaymentMutation = useMutation({
    mutationFn: () => matchApi.reportSpotPayment(matchId!, athleteId),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      qc.invalidateQueries({ queryKey: ['match-detail', matchId] });
      Alert.alert('Pagamento informado', 'O administrador foi avisado para conferir o Pix.');
    },
    onError: (error: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erro', error?.response?.data?.error || 'Nao foi possivel informar o pagamento.');
    },
  });

  const checkInMutation = useMutation({
    mutationFn: () => matchApi.checkIn(matchId!, athleteId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['match-detail', matchId] });
      Alert.alert('Check-in confirmado', 'Sua presenca no local foi registrada.');
    },
    onError: (error: any) => Alert.alert('Erro', error?.response?.data?.error || 'Nao foi possivel fazer check-in.'),
  });

  const respondSpotApplicationMutation = useMutation({
    mutationFn: ({ applicationId, accept }: { applicationId: string; accept: boolean }) =>
      matchApi.respondSpotApplication(applicationId, accept),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['spot-applications', matchId] });
      qc.invalidateQueries({ queryKey: ['match-detail', matchId] });
      qc.invalidateQueries({ queryKey: ['nearby-athletes-all', matchId] });
    },
    onError: (error: any) => Alert.alert('Erro', error?.response?.data?.error || 'Nao foi possivel responder a candidatura.'),
  });

  const cancelPresenceMutation = useMutation({
    mutationFn: () => matchApi.cancelPresence(matchId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['match-detail', matchId] });
      qc.invalidateQueries({ queryKey: ['dashboard', athleteId] });
      Alert.alert('Check-in cancelado', 'Sua vaga foi aberta e o administrador foi avisado.');
      router.replace('/' as any);
    },
    onError: (error: any) => Alert.alert('Erro', error?.response?.data?.error || 'Nao foi possivel cancelar sua presenca.'),
  });

  const confirmCancelPresence = useCallback(() => {
    Alert.alert(
      'Cancelar check-in?',
      'Sua vaga sera aberta para outro atleta e o administrador sera avisado.',
      [
        { text: 'Voltar', style: 'cancel' },
        { text: 'Cancelar check-in', style: 'destructive', onPress: () => cancelPresenceMutation.mutate() },
      ],
    );
  }, [cancelPresenceMutation]);

  const matchmakingMutation = useMutation({
    mutationFn: () => matchApi.matchmaking(matchId!, 2),
    onSuccess: async () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await qc.refetchQueries({ queryKey: ['match-detail', matchId], type: 'active' });
      qc.invalidateQueries({ queryKey: ['dashboard', athleteId] });
    },
    onError: (error: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erro', error?.response?.data?.error || 'Nao foi possivel montar os times.');
    },
  });

  const scoreMutation = useMutation({
    mutationFn: () => matchApi.registerScore(matchId!, Number(scoreA) || 0, Number(scoreB) || 0),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['match-detail', matchId] });
      Alert.alert('Placar registrado', 'O resultado foi salvo no historico.');
    },
    onError: (error: any) => Alert.alert('Erro', error?.response?.data?.error || 'Nao foi possivel registrar o placar.'),
  });

  const setAthleteRating = useCallback((evaluatedAthleteId: string, stars: number) => {
    if (savedRatingStars[evaluatedAthleteId] !== undefined) return;
    setRatingStars((current) => ({ ...current, [evaluatedAthleteId]: stars }));
  }, [savedRatingStars]);

  const pendingRatings = useMemo(() => Object.entries(ratingStars)
    .filter(([evaluatedAthleteId]) => savedRatingStars[evaluatedAthleteId] === undefined)
    .map(([evaluatedAthleteId, stars]) => ({ evaluatedAthleteId, stars })), [ratingStars, savedRatingStars]);

  const ratingMutation = useMutation({
    mutationFn: async () => {
      if (pendingRatings.length === 0) return [];
      return Promise.all(pendingRatings.map((rating) => matchApi.registerRating(matchId!, rating)));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['match-detail', matchId] });
      Alert.alert('Avaliacoes enviadas', 'As notas dos atletas foram registradas.');
    },
    onError: (error: any) => {
      Alert.alert('Erro', error?.response?.data?.error || 'Nao foi possivel enviar as avaliacoes.');
    },
  });

  const summary = useMemo(() => {
    if (!data) return null;
    const confirmed = data.presence.filter((presence) => presence.status === 'CONFIRMED').length;
    const visibleTeamComposition = data.teamComposition ?? null;
    const hasVisibleTeamComposition = !!visibleTeamComposition;
    const minimumConfirmed = data.minimumConfirmed ?? minimumConfirmedFor(data.type);
    const phase = data.phase ?? deriveMatchPhase({
      status: data.status,
      type: data.type,
      confirmedCount: confirmed,
      isDrafted: data.isDrafted,
    });

    return {
      ...formatDateTime(data.date),
      confirmed,
      waitlisted: data.presence.filter((presence) => presence.status === 'WAITLISTED').length,
      declined: data.presence.filter((presence) => presence.status === 'DECLINED').length,
      pending: data.presence.filter((presence) => presence.status === 'PENDING').length,
      spotsLeft: data.totalVacancies - confirmed,
      pct: Math.min((confirmed / data.totalVacancies) * 100, 100),
      currentPresence: data.presence.find((presence) => presence.athleteId === athleteId),
      ratableAthletes: data.presence.filter((presence) => presence.status === 'CONFIRMED' && presence.athleteId !== athleteId),
      filteredPresence: presenceFilter === 'ALL'
        ? data.presence
        : data.presence.filter((presence) => presence.status === presenceFilter),
      visibleTeamComposition: visibleTeamComposition ?? { teams: [], overallDifference: 0 },
      hasVisibleTeamComposition,
      hasRegisteredScore: !!data.score,
      minimumConfirmed,
      phase,
      canDrawTeams: isAdmin && phase === 'CONFIRMED_WAITING_DRAW',
      shouldSuggestSpot: isAdmin && phase === 'WAITING_CONFIRMATION' && confirmed < minimumConfirmed,
      pendingSpotApplications: spotApplications.filter((application) => application.status === 'PENDING'),
    };
  }, [athleteId, data, isAdmin, presenceFilter, spotApplications]);

  const goToEdit = useCallback(() => {
    router.push({ pathname: '/matches/create-match', params: { groupId, matchId } } as any);
  }, [groupId, matchId, router]);

  const goToLiveMatch = useCallback(() => {
    router.push(`/matches/live/${matchId}` as any);
  }, [matchId, router]);

  return {
    athleteId,
    data,
    groupId,
    guestOpen,
    guestVacancies,
    isAdmin,
    isError,
    isLoading,
    matchId,
    maxAge,
    minAge,
    minOverall,
    nameSearch,
    nearby,
    presenceFilter,
    radiusKm,
    ratingStars,
    savedRatingStars,
    pendingRatingsCount: pendingRatings.length,
    refetch,
    scoreA,
    scoreB,
    selectedSpotAthleteIds,
    selectedSpotAthletesCount,
    selectedVisibleCount,
    finishComment,
    finishModalVisible,
    gender,
    summary,
    cancelPresenceMutation,
    checkInMutation,
    closeGuestMutation,
    confirmCancelPresence,
    finishMatchMutation,
    goToEdit,
    goToLiveMatch,
    matchmakingMutation,
    openGuestMutation,
    ratingMutation,
    reportSpotPaymentMutation,
    respondSpotApplicationMutation,
    scoreMutation,
    setFinishComment,
    setFinishModalVisible,
    setGender,
    setGuestOpen,
    setGuestVacancies,
    setMaxAge,
    setMinAge,
    setMinOverall,
    setNameSearch,
    setPresenceFilter,
    setRadiusKm,
    setScoreA,
    setScoreB,
    setAthleteRating,
    toggleFavoriteMutation,
    toggleSpotSelection,
  };
}
