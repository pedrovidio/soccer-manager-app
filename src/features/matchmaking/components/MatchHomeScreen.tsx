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
import { useAuthStore } from '../../auth/useAuthStore';
import { GuestSlotConfig, MatchPresence, NearbyAthlete, PresenceStatus, Gender } from '../types';
import { BackButton } from '../../common/components/BackButton';

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
  PENDING:   { label: 'Pendente',   bg: Colors.warningLight, color: Colors.warningDark, icon: 'time-outline' },
};

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'ANY', label: 'Qualquer' },
  { value: 'M',   label: 'Masculino' },
  { value: 'F',   label: 'Feminino' },
];

// ─── Main Screen ──────────────────────────────────────────────────────────────

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

  // Modal states for cancel/finish
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [finishModalVisible, setFinishModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [finishComment, setFinishComment] = useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['match-detail', matchId],
    queryFn: () => matchApi.getDetail(matchId!),
    enabled: !!matchId,
  });

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
    queryKey: ['nearby-athletes-all', matchId],
    queryFn:  async () => {
      const result = await matchApi.nearbyAthletes(matchId!, {});
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

  const guestConfig: Partial<GuestSlotConfig> = {
    guestVacancies: +guestVacancies || 2,
    minAge:         +minAge         || 16,
    maxAge:         +maxAge         || 50,
    gender,
    spotRadiusKm:   +radiusKm       || 10,
    minOverall:     +minOverall     || 0,
  };

  const openGuestMutation = useMutation({
    mutationFn: () => matchApi.openGuestSlots(matchId!, athleteId, guestConfig as GuestSlotConfig),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['match-detail', matchId] }); Alert.alert('Vagas abertas', `${nearby.length} atletas serão notificados.`); },
    onError: () => Alert.alert('Erro', 'Não foi possível abrir as vagas.'),
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

  return (
    <SafeAreaView style={s.safe}>

      {/* HEADER */}
      <View style={s.header}>
        <BackButton />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={s.headerTitle} numberOfLines={1}>{data.location}</Text>
          <Text style={s.headerSub}>{date}</Text>
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

          {/* STATUS BADGE */}
          <View style={[s.statusBadge, { backgroundColor: data.status === 'SCHEDULED' ? Colors.primaryLight : Colors.n100 }]}>
            <Text style={[s.statusBadgeText, { color: data.status === 'SCHEDULED' ? Colors.primary : Colors.n700 }]}>
              {data.status === 'SCHEDULED' ? 'Agendada' : data.status === 'IN_PROGRESS' ? 'Em andamento' : data.status === 'FINISHED' ? 'Finalizada' : 'Cancelada'}
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
          <Text style={s.progressLabel}>{confirmed} de {data.totalVacancies} vagas preenchidas</Text>
        </View>

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
                    Raio de {+radiusKm || 10} km
                  </Text>
                </View>

                {/* LISTA DE ATLETAS DISPONÍVEIS */}
                {nearby.length === 0 ? (
                  <View style={s.emptyCard}>
                    <Ionicons name="person-outline" size={32} color={Colors.n300} />
                    <Text style={s.emptyText}>Nenhum atleta encontrado com esses filtros</Text>
                  </View>
                ) : (
                  nearby.map((a) => (
                    <View key={a.id} style={s.guestRow}>
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
                    </View>
                  ))
                )}

                {/* BOTÃO CONVIDAR */}
                <TouchableOpacity
                  style={[s.inviteBtn, openGuestMutation.isPending && s.inviteBtnDisabled]}
                  onPress={() => openGuestMutation.mutate()}
                  disabled={openGuestMutation.isPending}
                  activeOpacity={0.8}
                >
                  {openGuestMutation.isPending
                    ? <ActivityIndicator color={Colors.white} size="small" />
                    : <>
                        <Ionicons name="send-outline" size={16} color={Colors.white} />
                        <Text style={s.inviteBtnText}>
                          Convidar {nearby.length} atleta{nearby.length !== 1 ? 's' : ''}
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
  guestAvatar:     { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  guestAvatarText: { fontSize: 13, fontWeight: '800', color: Colors.primary },
  guestName:       { fontSize: 13, fontWeight: '600', color: Colors.n900 },
  guestSub:        { fontSize: 11, color: Colors.n500, marginTop: 2 },
  ovrBadge:        { borderRadius: Radius.r999, paddingHorizontal: 10, paddingVertical: 4, alignItems: 'center' },
  ovrHigh:         { backgroundColor: Colors.successLight },
  ovrMid:          { backgroundColor: Colors.warningLight },
  ovrLow:          { backgroundColor: Colors.errorLight },
  ovrText:         { fontSize: 12, fontWeight: '800', color: Colors.n900 },

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
