import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  SafeAreaView, ActivityIndicator, Alert, Switch, TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '../../common/theme';
import { matchApi } from '../services/matchApi';
import { groupApi } from '../../groups/services/groupApi';
import { useAuthStore } from '../../auth/useAuthStore';
import { GuestSlotConfig, MatchPresence, NearbyAthlete, PresenceStatus, Gender, MatchmakingResult } from '../types';
import { BackButton } from '../../common/components/BackButton';
import { deriveMatchPhase, minimumConfirmedFor, phaseLabel } from '../utils/matchPhase';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDateTime(iso: string) {
  const d = new Date(iso);
  const date = d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return { date, time };
}

function posLabel(pos: string) {
  const map: Record<string, string> = {
    Goalkeeper: 'GOL', Defender: 'ZAG', Midfielder: 'MEI', Forward: 'ATA', Undefined: '—',
  };
  return map[pos] ?? pos.slice(0, 3).toUpperCase();
}

const STATUS_CONFIG: Record<PresenceStatus, { label: string; bg: string; color: string; icon: string }> = {
  CONFIRMED: { label: 'Confirmado', bg: Colors.successLight, color: Colors.successDark, icon: 'checkmark-circle' },
  DECLINED:  { label: 'Recusou',    bg: Colors.errorLight,   color: Colors.errorDark,   icon: 'close-circle' },
  PENDING:   { label: 'Aguardando confirmação', bg: Colors.warningLight, color: Colors.warningDark, icon: 'time-outline' },
};

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'ANY', label: 'Qualquer' },
  { value: 'M',   label: 'Masculino' },
  { value: 'F',   label: 'Feminino' },
];

// ─── Main Screen ──────────────────────────────────────────────────────────────

function teamNameFallback(teamNumber: number) {
  return `Time ${teamNumber}`;
}

export default function MatchHomeScreen() {
  const router   = useRouter();
  const qc       = useQueryClient();
  const { matchId, groupId, isAdmin: isAdminParam } = useLocalSearchParams<{ matchId: string; groupId: string; isAdmin: string }>();
  const athleteId = useAuthStore((s) => s.athleteId) ?? '';

  const [guestOpen, setGuestOpen]           = useState(false);
  const [guestVacancies, setGuestVacancies]   = useState('2');
  const [minAge, setMinAge]                   = useState('16');
  const [maxAge, setMaxAge]                   = useState('50');
  const [gender, setGender]                   = useState<Gender>('ANY');
  const [radiusKm, setRadiusKm]               = useState('10');
  const [minOverall, setMinOverall]           = useState('0');
  const [nameSearch, setNameSearch]           = useState('');
  const [selectedSpotAthleteIds, setSelectedSpotAthleteIds] = useState<string[]>([]);

  // Modal states for cancel/finish
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [finishModalVisible, setFinishModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [finishComment, setFinishComment] = useState('');
  const [matchmakingResult, setMatchmakingResult] = useState<MatchmakingResult | null>(null);
  const [scoreA, setScoreA] = useState('');
  const [scoreB, setScoreB] = useState('');
  const [ratingTarget, setRatingTarget] = useState<MatchPresence | null>(null);
  const [ratingStats, setRatingStats] = useState({
    pace: '70', shooting: '70', passing: '70', dribbling: '70', defense: '70', physical: '70',
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['match-detail', matchId],
    queryFn: () => matchApi.getDetail(matchId!, athleteId),
    enabled: !!matchId,
  });

  useEffect(() => {
    if (!data?.matchmakingResult) return;
    setMatchmakingResult(data.matchmakingResult);
  }, [data?.matchmakingResult]);

  // Busca atletas próximos diretamente no banco via backend
  // com debounce para não disparar a cada tecla
  const [debouncedConfig, setDebouncedConfig] = useState({
    radiusKm: 10, minAge: 16, maxAge: 50, gender: 'ANY' as Gender, minOverall: 0,
  });

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedConfig({
        radiusKm:   +radiusKm   || 10,
        minAge:     +minAge     || 16,
        maxAge:     +maxAge     || 50,
        gender,
        minOverall: +minOverall || 0,
      });
    }, 600);
    return () => clearTimeout(t);
  }, [radiusKm, minAge, maxAge, gender, minOverall]);

  const { data: allAthletes = [] } = useQuery<NearbyAthlete[]>({
    queryKey: ['nearby-athletes-all', matchId, debouncedConfig],
    queryFn:  async () => {
      const result = await matchApi.nearbyAthletes(matchId!, {
        spotRadiusKm: debouncedConfig.radiusKm,
        minAge: debouncedConfig.minAge,
        maxAge: debouncedConfig.maxAge,
        gender: debouncedConfig.gender,
        minOverall: debouncedConfig.minOverall,
      });
      return Array.isArray(result) ? result : [];
    },
    enabled:  !!matchId && guestOpen,
    staleTime: 30_000,
  });

  const nearby = allAthletes.filter((a) => {
    if (a.overall < debouncedConfig.minOverall) return false;
    if (a.age < debouncedConfig.minAge || a.age > debouncedConfig.maxAge) return false;
    if (debouncedConfig.gender !== 'ANY' && a.gender !== debouncedConfig.gender) return false;
    if (nameSearch.trim() && !(a.name ?? '').toLowerCase().includes(nameSearch.trim().toLowerCase())) return false;
    return true;
  });
  const nearbyIds = new Set(nearby.map((a) => a.id));
  const selectedVisibleAthleteIds = selectedSpotAthleteIds.filter((id) => nearbyIds.has(id));
  const selectedVisibleCount = selectedVisibleAthleteIds.length;
  const selectedSpotAthletesCount = selectedSpotAthleteIds.length;

  const guestConfig: Partial<GuestSlotConfig> = {
    guestVacancies: +guestVacancies || 2,
    minAge:         +minAge         || 16,
    maxAge:         +maxAge         || 50,
    gender,
    spotRadiusKm:   +radiusKm       || 10,
    minOverall:     +minOverall     || 0,
  };

  const openGuestMutation = useMutation({
    mutationFn: () => matchApi.openGuestSlots(matchId!, athleteId, guestConfig as GuestSlotConfig, selectedSpotAthleteIds),
    onSuccess: (result: any) => {
      setSelectedSpotAthleteIds([]);
      qc.invalidateQueries({ queryKey: ['match-detail', matchId] });
      qc.invalidateQueries({ queryKey: ['nearby-athletes-all', matchId] });
      const sent = result?.spotInvitesSent ?? selectedSpotAthletesCount;
      const plural = sent !== 1;
      Alert.alert('Convites enviados', `${sent} atleta${plural ? 's' : ''} selecionado${plural ? 's' : ''} receber${plural ? 'ao' : 'a'} o convite.`);
    },
    onError: () => Alert.alert('Erro', 'Não foi possível abrir as vagas.'),
  });

  function toggleSpotSelection(targetAthleteId: string) {
    setSelectedSpotAthleteIds((current) =>
      current.includes(targetAthleteId)
        ? current.filter((id) => id !== targetAthleteId)
        : [...current, targetAthleteId],
    );
  }

  const toggleFavoriteMutation = useMutation({
    mutationFn: (athlete: NearbyAthlete) =>
      athlete.isFavorite
        ? groupApi.unfavoriteSpotAthlete(groupId!, athleteId, athlete.id)
        : groupApi.favoriteSpotAthlete(groupId!, athleteId, athlete.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['nearby-athletes-all', matchId] });
      qc.invalidateQueries({ queryKey: ['favorite-spot-athletes', groupId] });
    },
    onError: () => Alert.alert('Erro', 'NÃ£o foi possÃ­vel atualizar o favorito.'),
  });

  const closeGuestMutation = useMutation({
    mutationFn: () => matchApi.closeGuestSlots(matchId!, athleteId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['match-detail', matchId] }),
    onError: () => Alert.alert('Erro', 'Não foi possível fechar as vagas.'),
  });

  const cancelMatchMutation = useMutation({
    mutationFn: () => matchApi.cancelMatch(matchId!, athleteId, cancelReason),
    onSuccess: () => {
      setCancelModalVisible(false);
      setCancelReason('');
      qc.invalidateQueries({ queryKey: ['match-detail', matchId] });
      Alert.alert('Sucesso', 'Jogo cancelado com sucesso');
      refetch();
    },
    onError: (error: any) => {
      Alert.alert('Erro', error?.response?.data?.error || 'Não foi possível cancelar o jogo');
    },
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
    onError: (error: any) => {
      Alert.alert('Erro', error?.response?.data?.error || 'Não foi possível finalizar o jogo');
    },
  });

  const reportSpotPaymentMutation = useMutation({
    mutationFn: () => matchApi.reportSpotPayment(matchId!, athleteId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['match-detail', matchId] });
      Alert.alert('Pagamento informado', 'O administrador foi avisado para conferir o Pix.');
    },
    onError: (error: any) => {
      Alert.alert('Erro', error?.response?.data?.error || 'Não foi possível informar o pagamento.');
    },
  });

  const checkInMutation = useMutation({
    mutationFn: () => matchApi.checkIn(matchId!, athleteId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['match-detail', matchId] });
      Alert.alert('Check-in confirmado', 'Sua presença no local foi registrada.');
    },
    onError: (error: any) => {
      Alert.alert('Erro', error?.response?.data?.error || 'Não foi possível fazer check-in.');
    },
  });

  const matchmakingMutation = useMutation({
    mutationFn: () => matchApi.matchmaking(matchId!, 2),
    onSuccess: (result) => {
      setMatchmakingResult(result);
      qc.invalidateQueries({ queryKey: ['match-detail', matchId] });
    },
    onError: (error: any) => {
      Alert.alert('Erro', error?.response?.data?.error || 'Não foi possível montar os times.');
    },
  });

  const scoreMutation = useMutation({
    mutationFn: () => matchApi.registerScore(matchId!, athleteId, [
      { teamName: 'Time 1', goals: Number(scoreA) || 0 },
      { teamName: 'Time 2', goals: Number(scoreB) || 0 },
    ]),
    onSuccess: () => Alert.alert('Placar registrado', 'O resultado foi salvo no histórico.'),
    onError: (error: any) => {
      Alert.alert('Erro', error?.response?.data?.error || 'Não foi possível registrar o placar.');
    },
  });

  const ratingMutation = useMutation({
    mutationFn: () => {
      if (!ratingTarget) throw new Error('Selecione um atleta.');
      return matchApi.registerRating(matchId!, athleteId, ratingTarget.athleteId, {
        pace: Number(ratingStats.pace) || 0,
        shooting: Number(ratingStats.shooting) || 0,
        passing: Number(ratingStats.passing) || 0,
        dribbling: Number(ratingStats.dribbling) || 0,
        defense: Number(ratingStats.defense) || 0,
        physical: Number(ratingStats.physical) || 0,
      });
    },
    onSuccess: () => {
      setRatingTarget(null);
      Alert.alert('Avaliação enviada', 'A avaliação do atleta foi registrada.');
    },
    onError: (error: any) => {
      Alert.alert('Erro', error?.response?.data?.error || 'Não foi possível enviar a avaliação.');
    },
  });

  if (isLoading) {
    return (
      <SafeAreaView style={[s.safe, s.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (isError || !data) {
    return (
      <SafeAreaView style={[s.safe, s.center]}>
        <Ionicons name="alert-circle-outline" size={40} color={Colors.error} />
        <Text style={s.errorText}>Erro ao carregar a partida</Text>
        <TouchableOpacity style={s.retryBtn} onPress={() => refetch()}>
          <Text style={s.retryText}>Tentar novamente</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const { date, time } = formatDateTime(data.date);
  const confirmed  = data.presence.filter((p) => p.status === 'CONFIRMED').length;
  const declined   = data.presence.filter((p) => p.status === 'DECLINED').length;
  const pending    = data.presence.filter((p) => p.status === 'PENDING').length;
  const spotsLeft  = data.totalVacancies - confirmed;
  const pct        = Math.min((confirmed / data.totalVacancies) * 100, 100);
  const isAdmin = isAdminParam === '1';
  const currentPresence = data.presence.find((p) => p.athleteId === athleteId);
  const isParticipant = currentPresence?.status === 'CONFIRMED';
  const hasCheckedIn = Boolean(currentPresence?.checkedIn || data.checkedInIds?.includes(athleteId));
  const ratableAthletes = data.presence.filter((p) => p.status === 'CONFIRMED' && p.athleteId !== athleteId);
  const rawMatchmakingResult = matchmakingResult ?? data.matchmakingResult ?? null;
  const visibleMatchmakingResult: MatchmakingResult = rawMatchmakingResult ?? { teams: [], overallDifference: 0 };
  const hasVisibleMatchmakingResult = !!rawMatchmakingResult;
  const minimumConfirmed = data.minimumConfirmed ?? minimumConfirmedFor(data.type);
  const phase = data.phase ?? deriveMatchPhase({
    status: data.status,
    type: data.type,
    confirmedCount: confirmed,
    hasMatchmaking: hasVisibleMatchmakingResult,
  });
  const canDrawTeams = isAdmin && phase === 'CONFIRMED_WAITING_DRAW';
  const shouldSuggestSpot = isAdmin && phase === 'WAITING_CONFIRMATION' && confirmed < minimumConfirmed;

  return (
    <SafeAreaView style={s.safe}>

      {/* HEADER */}
      <View style={s.header}>
        <BackButton />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={s.headerTitle} numberOfLines={1}>{data.status === 'FINISHED' ? 'Partida encerrada' : 'Próxima partida'}</Text>
          <Text style={s.headerSub}>{data.location} · {date}</Text>
        </View>
        {isAdmin && (
          <TouchableOpacity
            style={s.editBtn}
            onPress={() => router.push({ pathname: '/create-match', params: { groupId, matchId } } as any)}
          >
            <Ionicons name="create-outline" size={20} color={Colors.n700} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>

        {/* ── INFO CARD ── */}
        <View style={s.infoCard}>
          <View style={s.infoRow}>
            <View style={s.infoItem}>
              <Ionicons name="time-outline" size={18} color={Colors.primary} />
              <Text style={s.infoValue}>{time}</Text>
              <Text style={s.infoLabel}>Horário</Text>
            </View>
            <View style={s.infoDivider} />
            <View style={s.infoItem}>
              <Ionicons name="football-outline" size={18} color={Colors.primary} />
              <Text style={s.infoValue}>{data.type}</Text>
              <Text style={s.infoLabel}>Modalidade</Text>
            </View>
            <View style={s.infoDivider} />
            <View style={s.infoItem}>
              <Ionicons name="people-outline" size={18} color={Colors.primary} />
              <Text style={s.infoValue}>{data.totalVacancies}</Text>
              <Text style={s.infoLabel}>Vagas</Text>
            </View>
          </View>

          <View style={[s.statusBadge, { backgroundColor: phase === 'WAITING_CONFIRMATION' ? Colors.warningLight : Colors.primaryLight }]}>
            <Text style={[s.statusBadgeText, { color: phase === 'WAITING_CONFIRMATION' ? Colors.warningDark : Colors.primary }]}>
              {phaseLabel(phase)}
            </Text>
          </View>

          {/* ADMIN ACTIONS */}
          {isAdmin && data.status !== 'FINISHED' && data.status !== 'CANCELLED' && (
            <View style={s.adminActionsRow}>
              <TouchableOpacity
                style={[s.actionBtn, s.actionBtnCancel]}
                onPress={() => setCancelModalVisible(true)}
                disabled={cancelMatchMutation.isPending}
                activeOpacity={0.7}
              >
                {cancelMatchMutation.isPending ? (
                  <ActivityIndicator color={Colors.errorDark} size="small" />
                ) : (
                  <>
                    <Ionicons name="close-circle" size={16} color={Colors.errorDark} />
                    <Text style={s.actionBtnTextCancel}>Cancelar</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[s.actionBtn, s.actionBtnFinish]}
                onPress={() => setFinishModalVisible(true)}
                disabled={finishMatchMutation.isPending}
                activeOpacity={0.7}
              >
                {finishMatchMutation.isPending ? (
                  <ActivityIndicator color={Colors.successDark} size="small" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={16} color={Colors.successDark} />
                    <Text style={s.actionBtnTextFinish}>Finalizar</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ── CONTADOR DE CONFIRMAÇÕES ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Confirmações</Text>
          <View style={s.counterCard}>
            <CounterBadge value={confirmed} label="Confirmados" color={Colors.success} />
            <CounterBadge value={pending}   label="Pendentes"   color={Colors.warning} />
            <CounterBadge value={declined}  label="Recusaram"   color={Colors.error} />
            <CounterBadge value={spotsLeft} label="Vagas livres" color={Colors.n500} />
          </View>
          {/* PROGRESS */}
          <View style={s.progressBg}>
            <View style={[s.progressFill, { width: `${pct}%` as any }]} />
          </View>
          <Text style={s.progressLabel}>{confirmed} de {data.totalVacancies} vagas preenchidas · mínimo {minimumConfirmed}</Text>
          {shouldSuggestSpot && (
            <View style={s.hintBox}>
              <Ionicons name="person-add-outline" size={16} color={Colors.warningDark} />
              <Text style={s.hintText}>Faltam {Math.max(minimumConfirmed - confirmed, 0)} atleta(s) para confirmar o jogo. Considere convidar avulsos.</Text>
            </View>
          )}
        </View>

        {hasVisibleMatchmakingResult && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Escalações</Text>
            <View style={s.teamsWrap}>
              {visibleMatchmakingResult.teams.map((team) => {
                const isMyTeam = team.athletes.some((athlete) => athlete.id === athleteId);
                return (
                  <View key={team.teamNumber} style={[s.teamBox, isMyTeam && s.myTeamBox]}>
                    <Text style={[s.teamTitle, isMyTeam && s.myTeamTitle]}>
                      {team.name ?? teamNameFallback(team.teamNumber)} · OVR {team.averageOverall}{isMyTeam ? ' · seu time' : ''}
                    </Text>
                    {team.athletes.map((athlete) => (
                      <Text key={athlete.id} style={[s.teamAthlete, athlete.id === athleteId && s.myTeamTitle]}>
                        {athlete.name}{athlete.id === athleteId ? ' (você)' : ''} · {posLabel(athlete.position)} · {athlete.overall}
                      </Text>
                    ))}
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {(isParticipant || isAdmin) && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Ações da partida</Text>
            <View style={s.matchActionsCard}>
              {isParticipant && data.status !== 'FINISHED' && data.status !== 'CANCELLED' && (
                <TouchableOpacity
                  style={[s.secondaryActionBtn, hasCheckedIn && s.secondaryActionDone]}
                  onPress={() => checkInMutation.mutate()}
                  disabled={hasCheckedIn || checkInMutation.isPending}
                  activeOpacity={0.7}
                >
                  <Ionicons name={hasCheckedIn ? 'checkmark-circle' : 'location-outline'} size={16} color={hasCheckedIn ? Colors.successDark : Colors.primary} />
                  <Text style={[s.secondaryActionText, hasCheckedIn && { color: Colors.successDark }]}>
                    {hasCheckedIn ? 'Check-in feito' : 'Fazer check-in'}
                  </Text>
                </TouchableOpacity>
              )}

              {isAdmin && data.status !== 'CANCELLED' && (
                <>
                  <View style={s.inlineActionRow}>
                    <TouchableOpacity
                      style={[s.secondaryActionBtn, { flex: 1 }]}
                      onPress={() => matchmakingMutation.mutate()}
                      disabled={!canDrawTeams || matchmakingMutation.isPending}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="shuffle-outline" size={16} color={Colors.primary} />
                      <Text style={s.secondaryActionText}>{canDrawTeams ? 'Sortear times' : 'Aguardando mínimo'}</Text>
                    </TouchableOpacity>
                  </View>

                  {false && hasVisibleMatchmakingResult && (
                    <View style={s.teamsWrap}>
                      <Text style={s.teamsDiff}>Diferença OVR: {visibleMatchmakingResult.overallDifference}</Text>
                      {visibleMatchmakingResult!.teams.map((team) => (
                        <View key={team.teamNumber} style={s.teamBox}>
                          <Text style={s.teamTitle}>
                            {team.name ?? teamNameFallback(team.teamNumber)} · OVR {team.averageOverall}
                          </Text>
                          {team.athletes.map((athlete) => (
                            <Text key={athlete.id} style={s.teamAthlete}>
                              {athlete.name} · {posLabel(athlete.position)} · {athlete.overall}
                            </Text>
                          ))}
                        </View>
                      ))}
                    </View>
                  )}
                </>
              )}
            </View>
          </View>
        )}

        {isParticipant && data.status === 'FINISHED' && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Pós-jogo</Text>
            <View style={s.matchActionsCard}>
              <Text style={s.filterLabel}>Registrar placar</Text>
              <View style={s.inlineActionRow}>
                <TextInput style={[s.filterInput, { flex: 1 }]} value={scoreA} onChangeText={setScoreA} keyboardType="numeric" placeholder="Time 1" />
                <TextInput style={[s.filterInput, { flex: 1 }]} value={scoreB} onChangeText={setScoreB} keyboardType="numeric" placeholder="Time 2" />
                <TouchableOpacity style={s.smallPrimaryBtn} onPress={() => scoreMutation.mutate()} disabled={scoreMutation.isPending}>
                  <Text style={s.smallPrimaryText}>Salvar</Text>
                </TouchableOpacity>
              </View>

              <Text style={[s.filterLabel, { marginTop: 12 }]}>Avaliar atletas</Text>
              {ratableAthletes.map((athlete) => (
                <TouchableOpacity key={athlete.athleteId} style={s.ratingRow} onPress={() => setRatingTarget(athlete)} activeOpacity={0.7}>
                  <Text style={s.ratingName}>{athlete.name}</Text>
                  <Ionicons name="chevron-forward" size={16} color={Colors.n400} />
                </TouchableOpacity>
              ))}

              {ratingTarget && (
                <View style={s.ratingBox}>
                  <Text style={s.ratingTitle}>Avaliar {ratingTarget.name}</Text>
                  <View style={s.ratingGrid}>
                    {([
                      ['pace', 'Vel.'],
                      ['shooting', 'Fin.'],
                      ['passing', 'Pas.'],
                      ['dribbling', 'Dri.'],
                      ['defense', 'Def.'],
                      ['physical', 'Fis.'],
                    ] as const).map(([key, label]) => (
                      <View key={key} style={s.ratingInputWrap}>
                        <Text style={s.ratingLabel}>{label}</Text>
                        <TextInput
                          style={s.ratingInput}
                          value={ratingStats[key]}
                          onChangeText={(v) => setRatingStats((prev) => ({ ...prev, [key]: v }))}
                          keyboardType="numeric"
                          maxLength={3}
                        />
                      </View>
                    ))}
                  </View>
                  <View style={s.inlineActionRow}>
                    <TouchableOpacity style={[s.modalBtn, s.modalBtnSecondary]} onPress={() => setRatingTarget(null)}>
                      <Text style={s.modalBtnTextSecondary}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[s.modalBtn, s.modalBtnPrimary]} onPress={() => ratingMutation.mutate()} disabled={ratingMutation.isPending}>
                      <Text style={s.modalBtnTextPrimary}>Enviar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {!isAdmin && data.status === 'FINISHED' && data.mySpotPayment?.status === 'PENDING' && (
          <View style={s.section}>
            <View style={s.paymentCard}>
              <View style={{ flex: 1 }}>
                <Text style={s.paymentTitle}>Pagamento do avulso</Text>
                <Text style={s.paymentText}>
                  {`Valor: R$ ${data.mySpotPayment.amount.toFixed(2).replace('.', ',')}`}
                </Text>
              </View>
              <TouchableOpacity
                style={[s.paymentBtn, reportSpotPaymentMutation.isPending && s.inviteBtnDisabled]}
                onPress={() => reportSpotPaymentMutation.mutate()}
                disabled={reportSpotPaymentMutation.isPending}
                activeOpacity={0.7}
              >
                {reportSpotPaymentMutation.isPending
                  ? <ActivityIndicator color={Colors.white} size="small" />
                  : <Text style={s.paymentBtnText}>
                      {data.mySpotPayment.paymentReportedAt ? 'Reenviar aviso' : 'Informar pagamento'}
                    </Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── LISTA DE PRESENÇA ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Lista de presença</Text>
          {data.presence.length === 0 ? (
            <View style={s.emptyCard}>
              <Text style={s.emptyText}>Nenhum membro ainda</Text>
            </View>
          ) : (
            data.presence.map((p) => <PresenceRow key={p.athleteId} item={p} />)
          )}
        </View>

        {/* ── VAGAS PARA AVULSOS (admin only) ── */}
        {isAdmin && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Vagas para avulsos</Text>
              <Switch
                value={guestOpen}
                onValueChange={(v) => {
                  setGuestOpen(v);
                  if (!v && data.guestConfig) closeGuestMutation.mutate();
                }}
                trackColor={{ true: Colors.primary }}
                thumbColor={Colors.white}
              />
            </View>

            {guestOpen && (
              <>
                {/* FILTROS */}
                <View style={s.guestFilters}>
                  <View style={s.filterRow}>
                    <View style={s.flex1}>
                      <Text style={s.filterLabel}>Vagas</Text>
                      <TextInput style={s.filterInput} value={guestVacancies} onChangeText={setGuestVacancies} keyboardType="numeric" />
                    </View>
                    <View style={s.flex1}>
                      <Text style={s.filterLabel}>Raio (km)</Text>
                      <TextInput style={s.filterInput} value={radiusKm} onChangeText={setRadiusKm} keyboardType="numeric" />
                    </View>
                    <View style={s.flex1}>
                      <Text style={s.filterLabel}>OVR mín.</Text>
                      <TextInput style={s.filterInput} value={minOverall} onChangeText={setMinOverall} keyboardType="numeric" />
                    </View>
                  </View>
                  <View style={s.filterRow}>
                    <View style={s.flex1}>
                      <Text style={s.filterLabel}>Idade mín.</Text>
                      <TextInput style={s.filterInput} value={minAge} onChangeText={setMinAge} keyboardType="numeric" />
                    </View>
                    <View style={s.flex1}>
                      <Text style={s.filterLabel}>Idade máx.</Text>
                      <TextInput style={s.filterInput} value={maxAge} onChangeText={setMaxAge} keyboardType="numeric" />
                    </View>
                    <View style={s.flex1} />
                  </View>

                  {/* GÊNERO */}
                  <Text style={s.filterLabel}>Gênero</Text>
                  <View style={s.genderRow}>
                    {GENDER_OPTIONS.map((g) => (
                      <TouchableOpacity
                        key={g.value}
                        style={[s.genderChip, gender === g.value && s.genderChipActive]}
                        onPress={() => setGender(g.value)}
                        activeOpacity={0.7}
                      >
                        <Text style={[s.genderChipText, gender === g.value && s.genderChipTextActive]}>
                          {g.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* BUSCA POR NOME */}
                <View style={s.searchWrap}>
                  <Ionicons name="search-outline" size={16} color={Colors.n400} style={s.searchIcon} />
                  <TextInput
                    style={s.searchInput}
                    placeholder="Buscar por nome..."
                    placeholderTextColor={Colors.n400}
                    value={nameSearch}
                    onChangeText={setNameSearch}
                    returnKeyType="search"
                  />
                  {nameSearch.length > 0 && (
                    <TouchableOpacity onPress={() => setNameSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Ionicons name="close-circle" size={16} color={Colors.n400} />
                    </TouchableOpacity>
                  )}
                </View>

                {/* CONTADOR DE ATLETAS */}
                <View style={s.athleteCounter}>
                  <View style={s.athleteCounterLeft}>
                    <Ionicons name="people" size={18} color={Colors.primary} />
                    <Text style={s.athleteCounterNum}>{nearby.length}</Text>
                    <Text style={s.athleteCounterLabel}>
                      atleta{nearby.length !== 1 ? 's' : ''} encontrado{nearby.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  <Text style={s.athleteCounterSub}>
                    {selectedSpotAthletesCount} selecionado{selectedSpotAthletesCount !== 1 ? 's' : ''}
                    {selectedSpotAthletesCount !== selectedVisibleCount ? ` (${selectedVisibleCount} visiveis)` : ''}
                  </Text>
                </View>

                {/* LISTA DE ATLETAS DISPONÍVEIS */}
                {nearby.length === 0 ? (
                  <View style={s.emptyCard}>
                    <Ionicons name="person-outline" size={32} color={Colors.n300} />
                    <Text style={s.emptyText}>Nenhum atleta encontrado com esses filtros</Text>
                  </View>
                ) : (
                  nearby.map((a) => {
                    const isSelected = selectedSpotAthleteIds.includes(a.id);
                    return (
                    <TouchableOpacity
                      key={a.id}
                      style={[s.guestRow, isSelected && s.guestRowSelected]}
                      onPress={() => toggleSpotSelection(a.id)}
                      activeOpacity={0.75}
                    >
                      <View style={[s.selectCircle, isSelected && s.selectCircleActive]}>
                        {isSelected && <Ionicons name="checkmark" size={14} color={Colors.white} />}
                      </View>
                      <View style={s.guestAvatar}>
                        <Text style={s.guestAvatarText}>{(a.name ?? '??').slice(0, 2).toUpperCase()}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.guestName}>{a.name}</Text>
                        <Text style={s.guestSub}>{posLabel(a.position ?? '')} · {a.age} anos · {a.gender === 'M' ? 'Masc.' : 'Fem.'}</Text>
                      </View>
                      <View style={[s.ovrBadge, a.overall >= 70 ? s.ovrHigh : a.overall >= 50 ? s.ovrMid : s.ovrLow]}>
                        <Text style={s.ovrText}>{a.overall}</Text>
                      </View>
                      <TouchableOpacity
                        style={[s.favoriteBtn, a.isFavorite && s.favoriteBtnActive]}
                        onPress={(event) => {
                          event.stopPropagation();
                          toggleFavoriteMutation.mutate(a);
                        }}
                        disabled={toggleFavoriteMutation.isPending}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={a.isFavorite ? 'star' : 'star-outline'}
                          size={18}
                          color={a.isFavorite ? Colors.warningDark : Colors.n400}
                        />
                      </TouchableOpacity>
                    </TouchableOpacity>
                    );
                  })
                )}

                {/* BOTÃO CONVIDAR */}
                <TouchableOpacity
                  style={[s.inviteBtn, (openGuestMutation.isPending || selectedSpotAthletesCount === 0) && s.inviteBtnDisabled]}
                  onPress={() => openGuestMutation.mutate()}
                  disabled={openGuestMutation.isPending || selectedSpotAthletesCount === 0}
                  activeOpacity={0.8}
                >
                  {openGuestMutation.isPending
                    ? <ActivityIndicator color={Colors.white} size="small" />
                    : <>
                        <Ionicons name="send-outline" size={16} color={Colors.white} />
                        <Text style={s.inviteBtnText}>
                          Convidar {selectedSpotAthletesCount} selecionado{selectedSpotAthletesCount !== 1 ? 's' : ''}
                        </Text>
                      </>
                  }
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

      </ScrollView>

      {/* MODAL CANCELAR JOGO */}
      {cancelModalVisible && (
        <View style={s.modalOverlay}>
          <View style={s.modal}>
            <Text style={s.modalTitle}>Cancelar Jogo</Text>
            <Text style={s.modalSubtitle}>Por favor, informe o motivo do cancelamento</Text>

            <TextInput
              style={s.modalInput}
              placeholder="Motivo (mín. 10 caracteres)"
              placeholderTextColor={Colors.n400}
              value={cancelReason}
              onChangeText={setCancelReason}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={s.modalButtonRow}>
              <TouchableOpacity
                style={[s.modalBtn, s.modalBtnSecondary]}
                onPress={() => {
                  setCancelModalVisible(false);
                  setCancelReason('');
                }}
                disabled={cancelMatchMutation.isPending}
              >
                <Text style={s.modalBtnTextSecondary}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[s.modalBtn, s.modalBtnPrimary, cancelReason.length < 10 && s.modalBtnDisabled]}
                onPress={() => cancelMatchMutation.mutate()}
                disabled={cancelReason.length < 10 || cancelMatchMutation.isPending}
              >
                {cancelMatchMutation.isPending ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <Text style={s.modalBtnTextPrimary}>Confirmar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* MODAL FINALIZAR JOGO */}
      {finishModalVisible && (
        <View style={s.modalOverlay}>
          <View style={s.modal}>
            <Text style={s.modalTitle}>Finalizar Jogo</Text>
            <Text style={s.modalSubtitle}>Você pode adicionar uma observação (opcional)</Text>

            <TextInput
              style={s.modalInput}
              placeholder="Observação (máx. 500 caracteres)"
              placeholderTextColor={Colors.n400}
              value={finishComment}
              onChangeText={setFinishComment}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <Text style={s.modalCharCount}>{finishComment.length}/500</Text>

            <View style={s.modalButtonRow}>
              <TouchableOpacity
                style={[s.modalBtn, s.modalBtnSecondary]}
                onPress={() => {
                  setFinishModalVisible(false);
                  setFinishComment('');
                }}
                disabled={finishMatchMutation.isPending}
              >
                <Text style={s.modalBtnTextSecondary}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[s.modalBtn, s.modalBtnPrimary]}
                onPress={() => finishMatchMutation.mutate()}
                disabled={finishComment.length > 500 || finishMatchMutation.isPending}
              >
                {finishMatchMutation.isPending ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <Text style={s.modalBtnTextPrimary}>Finalizar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CounterBadge({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <View style={s.counterItem}>
      <Text style={[s.counterValue, { color }]}>{value}</Text>
      <Text style={s.counterLabel}>{label}</Text>
    </View>
  );
}

function PresenceRow({ item }: { item: MatchPresence }) {
  const cfg = STATUS_CONFIG[item.status];
  return (
    <View style={s.presenceRow}>
      <View style={s.presenceAvatar}>
        <Text style={s.presenceAvatarText}>{item.name.slice(0, 2).toUpperCase()}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={s.presenceNameRow}>
          <Text style={s.presenceName}>{item.name}</Text>
          {item.isGuest && (
            <View style={s.guestTag}><Text style={s.guestTagText}>Avulso</Text></View>
          )}
        </View>
        <Text style={s.presenceSub}>{posLabel(item.position)} · OVR {item.overall}</Text>
      </View>
      <View style={[s.presenceBadge, { backgroundColor: cfg.bg }]}>
        <Ionicons name={cfg.icon as any} size={12} color={cfg.color} />
        <Text style={[s.presenceBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: Colors.n50 },
  scrollContent: { flexGrow: 1, paddingBottom: 20 },
  center:      { justifyContent: 'center', alignItems: 'center', gap: 8 },
  errorText:   { fontSize: 14, color: Colors.n700 },
  retryBtn:    { marginTop: 8, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: Colors.primary, borderRadius: Radius.r8 },
  retryText:   { color: Colors.white, fontWeight: '600' },

  header:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.n200, gap: 12, minHeight: 56 },
  backBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.n100, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 15, fontWeight: '800', color: Colors.n900 },
  headerSub:   { fontSize: 11, color: Colors.n500, textTransform: 'capitalize' },
  editBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.n100, alignItems: 'center', justifyContent: 'center' },

  infoCard:    { backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.n200, padding: Spacing.lg, gap: 12 },
  infoRow:     { flexDirection: 'row', alignItems: 'center' },
  infoItem:    { flex: 1, alignItems: 'center', gap: 2 },
  infoValue:   { fontSize: 15, fontWeight: '800', color: Colors.n900 },
  infoLabel:   { fontSize: 10, color: Colors.n500 },
  infoDivider: { width: 1, height: 36, backgroundColor: Colors.n200 },
  statusBadge: { alignSelf: 'flex-start', borderRadius: Radius.r999, paddingHorizontal: 12, paddingVertical: 4 },
  statusBadgeText: { fontSize: 12, fontWeight: '700' },

  section:      { marginTop: Spacing.lg, paddingHorizontal: Spacing.lg },
  sectionHeader:{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: Colors.n900, marginBottom: 10 },

  counterCard:  { flexDirection: 'row', backgroundColor: Colors.white, borderRadius: Radius.r12, borderWidth: 1, borderColor: Colors.n200, marginBottom: 10 },
  counterItem:  { flex: 1, alignItems: 'center', paddingVertical: 12, gap: 2 },
  counterValue: { fontSize: 22, fontWeight: '800' },
  counterLabel: { fontSize: 10, color: Colors.n500 },

  progressBg:   { height: 6, backgroundColor: Colors.n200, borderRadius: Radius.r999, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: Radius.r999 },
  progressLabel:{ fontSize: 11, color: Colors.n500, marginTop: 6, textAlign: 'right' },
  hintBox:      { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.warningLight, borderRadius: Radius.r8, padding: 10, marginTop: 10 },
  hintText:     { flex: 1, fontSize: 12, fontWeight: '700', color: Colors.warningDark },

  emptyCard:    { alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.r12, borderWidth: 1, borderColor: Colors.n200, paddingVertical: 20 },
  emptyText:    { fontSize: 13, color: Colors.n400 },

  presenceRow:      { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.r12, borderWidth: 1, borderColor: Colors.n200, padding: Spacing.md, marginBottom: 6, gap: 10 },
  presenceAvatar:   { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  presenceAvatarText:{ fontSize: 12, fontWeight: '800', color: Colors.primary },
  presenceNameRow:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  presenceName:     { fontSize: 13, fontWeight: '600', color: Colors.n900 },
  presenceSub:      { fontSize: 11, color: Colors.n500, marginTop: 2 },
  presenceBadge:    { flexDirection: 'row', alignItems: 'center', gap: 3, borderRadius: Radius.r999, paddingHorizontal: 8, paddingVertical: 4 },
  presenceBadgeText:{ fontSize: 11, fontWeight: '600' },
  guestTag:         { backgroundColor: Colors.n100, borderRadius: Radius.r4, paddingHorizontal: 5, paddingVertical: 2 },
  guestTagText:     { fontSize: 10, fontWeight: '600', color: Colors.n700 },

  searchWrap:    { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.r8, borderWidth: 1, borderColor: Colors.n300, paddingHorizontal: 10, marginBottom: 8, gap: 6 },
  searchIcon:    { flexShrink: 0 },
  searchInput:   { flex: 1, fontSize: 14, color: Colors.n900, paddingVertical: 9 },

  guestFilters:  { backgroundColor: Colors.white, borderRadius: Radius.r12, borderWidth: 1, borderColor: Colors.n200, padding: Spacing.md, marginBottom: 10 },
  filterRow:     { flexDirection: 'row', gap: 10, marginBottom: 8 },
  filterLabel:   { fontSize: 11, fontWeight: '600', color: Colors.n700, marginBottom: 4 },
  filterInput:   { backgroundColor: Colors.n50, borderWidth: 1, borderColor: Colors.n300, borderRadius: Radius.r8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 14, color: Colors.n900 },
  flex1:         { flex: 1 },

  genderRow:         { flexDirection: 'row', gap: 8, marginTop: 4 },
  genderChip:        { flex: 1, alignItems: 'center', paddingVertical: 7, borderRadius: Radius.r8, borderWidth: 1, borderColor: Colors.n300, backgroundColor: Colors.white },
  genderChipActive:  { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  genderChipText:    { fontSize: 12, fontWeight: '500', color: Colors.n700 },
  genderChipTextActive: { color: Colors.primary, fontWeight: '700' },

  athleteCounter:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.primaryLight, borderRadius: Radius.r12, padding: Spacing.md, marginBottom: 8 },
  athleteCounterLeft:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  athleteCounterNum:   { fontSize: 22, fontWeight: '800', color: Colors.primary },
  athleteCounterLabel: { fontSize: 13, fontWeight: '500', color: Colors.primary },
  athleteCounterSub:   { fontSize: 12, color: Colors.primaryDark, fontWeight: '600' },

  guestRow:        { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.r12, borderWidth: 1, borderColor: Colors.n200, padding: Spacing.md, marginBottom: 6, gap: 10 },
  guestRowSelected: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  selectCircle:    { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Colors.n300, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.white },
  selectCircleActive: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  guestAvatar:     { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  guestAvatarText: { fontSize: 13, fontWeight: '800', color: Colors.primary },
  guestName:       { fontSize: 13, fontWeight: '600', color: Colors.n900 },
  guestSub:        { fontSize: 11, color: Colors.n500, marginTop: 2 },
  ovrBadge:        { borderRadius: Radius.r999, paddingHorizontal: 10, paddingVertical: 4, alignItems: 'center' },
  ovrHigh:         { backgroundColor: Colors.successLight },
  ovrMid:          { backgroundColor: Colors.warningLight },
  ovrLow:          { backgroundColor: Colors.errorLight },
  ovrText:         { fontSize: 12, fontWeight: '800', color: Colors.n900 },
  favoriteBtn:     { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.n100, alignItems: 'center', justifyContent: 'center' },
  favoriteBtnActive: { backgroundColor: Colors.warningLight },

  paymentCard:     { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.r12, borderWidth: 1, borderColor: Colors.n200, padding: Spacing.md, gap: 10 },
  paymentTitle:    { fontSize: 13, fontWeight: '800', color: Colors.n900 },
  paymentText:     { fontSize: 12, color: Colors.n500, marginTop: 2 },
  paymentBtn:      { backgroundColor: Colors.primary, borderRadius: Radius.r8, paddingHorizontal: 12, paddingVertical: 9 },
  paymentBtnText:  { color: Colors.white, fontSize: 12, fontWeight: '700' },

  matchActionsCard: { backgroundColor: Colors.white, borderRadius: Radius.r12, borderWidth: 1, borderColor: Colors.n200, padding: Spacing.md, gap: 10 },
  inlineActionRow:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  secondaryActionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: Colors.primaryLight, borderRadius: Radius.r8, paddingHorizontal: 12, paddingVertical: 10 },
  secondaryActionDone: { backgroundColor: Colors.successLight },
  secondaryActionText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  smallPrimaryBtn: { backgroundColor: Colors.primary, borderRadius: Radius.r8, paddingHorizontal: 12, paddingVertical: 10 },
  smallPrimaryText: { fontSize: 12, fontWeight: '700', color: Colors.white },
  teamsWrap:       { gap: 8 },
  teamsDiff:       { fontSize: 11, fontWeight: '700', color: Colors.n500 },
  teamBox:         { backgroundColor: Colors.n50, borderRadius: Radius.r8, borderWidth: 1, borderColor: Colors.n200, padding: 10 },
  myTeamBox:       { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  teamTitle:       { fontSize: 12, fontWeight: '800', color: Colors.n900, marginBottom: 4 },
  myTeamTitle:     { color: Colors.primary },
  teamAthlete:     { fontSize: 11, color: Colors.n600, marginTop: 2 },
  ratingRow:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: Colors.n200, borderRadius: Radius.r8, paddingHorizontal: 10, paddingVertical: 9 },
  ratingName:      { fontSize: 12, fontWeight: '600', color: Colors.n900 },
  ratingBox:       { borderWidth: 1, borderColor: Colors.n200, borderRadius: Radius.r8, padding: 10, gap: 10 },
  ratingTitle:     { fontSize: 13, fontWeight: '800', color: Colors.n900 },
  ratingGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  ratingInputWrap: { width: '30%' },
  ratingLabel:     { fontSize: 10, fontWeight: '700', color: Colors.n500, marginBottom: 3 },
  ratingInput:     { backgroundColor: Colors.n50, borderWidth: 1, borderColor: Colors.n300, borderRadius: Radius.r8, paddingHorizontal: 8, paddingVertical: 7, fontSize: 13, color: Colors.n900 },

  inviteBtn:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, borderRadius: Radius.r12, paddingVertical: 13 },
  inviteBtnDisabled: { opacity: 0.6 },
  inviteBtnText:     { color: Colors.white, fontSize: 14, fontWeight: '700' },

  adminActionsRow:   { flexDirection: 'row', gap: 10, marginTop: 12 },
  actionBtn:         { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: Radius.r8, paddingVertical: 10 },
  actionBtnCancel:   { backgroundColor: Colors.errorLight, borderWidth: 1, borderColor: Colors.error },
  actionBtnFinish:   { backgroundColor: Colors.successLight, borderWidth: 1, borderColor: Colors.success },
  actionBtnTextCancel: { fontSize: 12, fontWeight: '700', color: Colors.errorDark },
  actionBtnTextFinish: { fontSize: 12, fontWeight: '700', color: Colors.successDark },

  modalOverlay:      { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end', alignItems: 'center' },
  modal:             { backgroundColor: Colors.white, borderTopLeftRadius: Radius.r16, borderTopRightRadius: Radius.r16, padding: Spacing.lg, width: '100%', maxHeight: '80%' },
  modalTitle:        { fontSize: 16, fontWeight: '800', color: Colors.n900, marginBottom: 4 },
  modalSubtitle:     { fontSize: 13, color: Colors.n500, marginBottom: 16 },
  modalInput:        { backgroundColor: Colors.n50, borderWidth: 1, borderColor: Colors.n300, borderRadius: Radius.r8, paddingHorizontal: 12, paddingVertical: 12, fontSize: 14, color: Colors.n900, marginBottom: 8, maxHeight: 120 },
  modalCharCount:    { fontSize: 11, color: Colors.n500, marginBottom: 16, textAlign: 'right' },
  modalButtonRow:    { flexDirection: 'row', gap: 10 },
  modalBtn:          { flex: 1, paddingVertical: 12, borderRadius: Radius.r8, alignItems: 'center', justifyContent: 'center' },
  modalBtnPrimary:   { backgroundColor: Colors.primary },
  modalBtnSecondary: { backgroundColor: Colors.n100, borderWidth: 1, borderColor: Colors.n300 },
  modalBtnTextPrimary: { color: Colors.white, fontSize: 14, fontWeight: '700' },
  modalBtnTextSecondary: { color: Colors.n700, fontSize: 14, fontWeight: '700' },
  modalBtnDisabled:  { opacity: 0.5 },
});
