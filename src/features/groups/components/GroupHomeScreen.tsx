import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  SafeAreaView, ActivityIndicator, RefreshControl, Alert, Modal, Pressable, Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '../../common/theme';
import { groupApi } from '../services/groupApi';
import { matchApi } from '../../matchmaking/services/matchApi';
import { athleteApi } from '../../athletes/services/athleteApi';
import { useAuthStore } from '../../auth/useAuthStore';
import { FavoriteSpotAthlete, GroupMember, GroupUpcomingMatch } from '../groupTypes';
import { SpotPayment } from '../../matchmaking/types';
import { BackButton } from '../../common/components/BackButton';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function positionLabel(pos: string) {
  const map: Record<string, string> = {
    Goalkeeper: 'GOL', Defender: 'ZAG', Midfielder: 'MEI', Forward: 'ATA', Undefined: '—',
  };
  return map[pos] ?? pos.slice(0, 3).toUpperCase();
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function GroupHomeScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const athleteId = useAuthStore((s) => s.athleteId) ?? '';
  const [selectedMember, setSelectedMember] = useState<GroupMember | null>(null);
  const [profileMember, setProfileMember] = useState<GroupMember | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const membersOffsetY = useRef<number>(0);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['group-home', groupId],
    queryFn: () => groupApi.getHome(groupId!, athleteId),
    enabled: !!groupId && !!athleteId,
  });

  const { data: favoriteSpotAthletes = [] } = useQuery({
    queryKey: ['favorite-spot-athletes', groupId],
    queryFn: () => groupApi.listFavoriteSpotAthletes(groupId!, athleteId),
    enabled: !!groupId && !!athleteId && data?.isAdmin === true,
  });

  const { data: spotPayments = [] } = useQuery({
    queryKey: ['spot-payments', groupId],
    queryFn: () => matchApi.listSpotPayments(groupId!, athleteId),
    enabled: !!groupId && !!athleteId && data?.isAdmin === true,
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: (targetAthleteId: string) => groupApi.unfavoriteSpotAthlete(groupId!, athleteId, targetAthleteId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['favorite-spot-athletes', groupId] });
      qc.invalidateQueries({ queryKey: ['nearby-athletes-all'] });
    },
    onError: () => Alert.alert('Erro', 'NÃ£o foi possÃ­vel remover o favorito.'),
  });

  const confirmSpotPaymentMutation = useMutation({
    mutationFn: (transactionId: string) => matchApi.confirmSpotPayment(transactionId, athleteId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['spot-payments', groupId] }),
    onError: () => Alert.alert('Erro', 'Não foi possível confirmar o pagamento.'),
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
        <Text style={s.errorText}>Erro ao carregar o grupo</Text>
        <TouchableOpacity style={s.retryBtn} onPress={() => refetch()}>
          <Text style={s.retryText}>Tentar novamente</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const { group, isAdmin, members, upcomingMatches, balance } = data;
  const activeMembers  = members.filter((m) => !m.hasDebt && !m.isInjured && !m.isBlocked);
  const blockedMembers = members.filter((m) => m.hasDebt || m.isInjured || m.isBlocked);

  return (
    <SafeAreaView style={s.safe}>

      {/* ── HEADER ── */}
      <View style={s.header}>
        <BackButton />
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle} numberOfLines={1}>{group.name}</Text>
          <Text style={s.headerSub}>{members.length} membros</Text>
        </View>
        {isAdmin && (
          <TouchableOpacity
            style={s.editBtn}
            onPress={() => router.push({ pathname: '/edit-group', params: { groupId } } as any)}
          >
            <Ionicons name="settings-outline" size={20} color={Colors.n700} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} colors={[Colors.primary]} />}
      >

        {/* ── QUICK ACTIONS ── */}
        <View style={s.actionsRow}>
          {isAdmin && (
            <QuickAction
              icon="person-add-outline"
              label="Convidar"
              onPress={() => router.push({ pathname: '/invite-athlete', params: { groupId, groupName: group.name } } as any)}
            />
          )}
          {isAdmin && (
            <QuickAction
              icon="football-outline"
              label="Nova partida"
              onPress={() => router.push({ pathname: '/create-match', params: { groupId } } as any)}
            />
          )}
          <QuickAction
            icon="people-outline"
            label="Membros"
            onPress={() => scrollRef.current?.scrollTo({ y: membersOffsetY.current, animated: true })}
          />
          {isAdmin && (
            <QuickAction
              icon="wallet-outline"
              label="Financeiro"
              onPress={() => router.push({ pathname: '/group-finance', params: { groupId } } as any)}
            />
          )}
        </View>

        {/* ── BALANCE CARD (admin only) ── */}
        {balance && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Caixa do grupo</Text>
            <View style={s.balanceCard}>
              <View style={s.balanceItem}>
                <Text style={s.balanceLabel}>Em caixa</Text>
                <Text style={[s.balanceValue, { color: Colors.success }]}>
                  {isAdmin ? formatCurrency(balance.cashInHand) : '—'}
                </Text>
              </View>
              <View style={s.balanceDivider} />
              <View style={s.balanceItem}>
                <Text style={s.balanceLabel}>Pendente</Text>
                <Text style={[s.balanceValue, { color: Colors.warning }]}>
                  {isAdmin ? formatCurrency(balance.totalPending) : '—'}
                </Text>
              </View>
              <View style={s.balanceDivider} />
              <View style={s.balanceItem}>
                <Text style={s.balanceLabel}>Mensalidade</Text>
                <Text style={s.balanceValue}>{formatCurrency(group.monthlyFee)}</Text>
              </View>
              <View style={s.balanceDivider} />
              <View style={s.balanceItem}>
                <Text style={s.balanceLabel}>Avulso</Text>
                <Text style={s.balanceValue}>{formatCurrency(group.spotFee)}</Text>
              </View>
            </View>
          </View>
        )}

        {isAdmin && spotPayments.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Pagamentos de avulsos</Text>
            {spotPayments.map((payment) => (
              <SpotPaymentRow
                key={payment.id}
                payment={payment}
                onConfirm={() => confirmSpotPaymentMutation.mutate(payment.id)}
                disabled={confirmSpotPaymentMutation.isPending}
              />
            ))}
          </View>
        )}

        {isAdmin && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Avulsos favoritos</Text>
              <Ionicons name="star" size={18} color={Colors.warningDark} />
            </View>

            {favoriteSpotAthletes.length === 0 ? (
              <View style={s.emptyCard}>
                <Ionicons name="star-outline" size={32} color={Colors.n300} />
                <Text style={s.emptyText}>Nenhum avulso favorito ainda</Text>
              </View>
            ) : (
              favoriteSpotAthletes.map((favorite) => (
                <FavoriteSpotAthleteRow
                  key={favorite.athleteId}
                  item={favorite}
                  onRemove={() => removeFavoriteMutation.mutate(favorite.athleteId)}
                  disabled={removeFavoriteMutation.isPending}
                />
              ))
            )}
          </View>
        )}

        {/* ── UPCOMING MATCHES ── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Próximas partidas</Text>
            {isAdmin && (
              <TouchableOpacity onPress={() => router.push({ pathname: '/create-match', params: { groupId } } as any)}>
                <Ionicons name="add-circle-outline" size={22} color={Colors.primary} />
              </TouchableOpacity>
            )}
          </View>

          {upcomingMatches.length === 0 ? (
            <View style={s.emptyCard}>
              <Ionicons name="football-outline" size={32} color={Colors.n300} />
              <Text style={s.emptyText}>Nenhuma partida agendada</Text>
              {isAdmin && (
                <TouchableOpacity
                  style={s.emptyAction}
                  onPress={() => router.push({ pathname: '/create-match', params: { groupId } } as any)}
                >
                  <Text style={s.emptyActionText}>Marcar partida</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            upcomingMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                onPress={() => router.push({ pathname: '/match-home', params: { matchId: match.id, groupId, isAdmin: isAdmin ? '1' : '0' } } as any)}
              />
            ))
          )}
        </View>

        {/* ── MEMBERS ── */}
        <View
          style={s.section}
          onLayout={(e) => { membersOffsetY.current = e.nativeEvent.layout.y; }}
        >
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Membros ({members.length})</Text>
            {isAdmin && (
              <TouchableOpacity
                style={s.inviteBtn}
                onPress={() => router.push({ pathname: '/invite-athlete', params: { groupId, groupName: group.name } } as any)}
              >
                <Ionicons name="person-add-outline" size={14} color={Colors.primary} />
                <Text style={s.inviteBtnText}>Convidar</Text>
              </TouchableOpacity>
            )}
          </View>

          {activeMembers.map((m) => (
            <MemberRow
              key={m.id} member={m} isAdmin={isAdmin}
              onPress={() => setProfileMember(m)}
              onOptions={isAdmin && m.id !== athleteId ? () => setSelectedMember(m) : undefined}
            />
          ))}
          {blockedMembers.length > 0 && (
            <>
              <Text style={s.memberGroupLabel}>Bloqueados</Text>
              {blockedMembers.map((m) => (
                <MemberRow
                  key={m.id} member={m} isAdmin={isAdmin}
                  onPress={() => setProfileMember(m)}
                  onOptions={isAdmin && m.id !== athleteId ? () => setSelectedMember(m) : undefined}
                />
              ))}
            </>
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* ── MODALS (fora do ScrollView para cobrir tela toda) ── */}
      <MemberProfileModal
        member={profileMember}
        onClose={() => setProfileMember(null)}
      />
      <MemberOptionsModal
        member={selectedMember}
        groupId={groupId!}
        currentAthleteId={athleteId}
        onClose={() => setSelectedMember(null)}
        onRefresh={refetch}
      />

    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function QuickAction({ icon, label, onPress }: { icon: any; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={s.quickAction} onPress={onPress} activeOpacity={0.7}>
      <View style={s.quickActionIcon}>
        <Ionicons name={icon} size={22} color={Colors.primary} />
      </View>
      <Text style={s.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function FavoriteSpotAthleteRow({
  item, onRemove, disabled,
}: {
  item: FavoriteSpotAthlete;
  onRemove: () => void;
  disabled: boolean;
}) {
  return (
    <View style={s.favoriteRow}>
      <View style={s.favoriteAvatar}>
        <Text style={s.favoriteAvatarText}>{item.name.slice(0, 2).toUpperCase()}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.favoriteName} numberOfLines={1}>{item.name}</Text>
        <Text style={s.favoriteMeta}>
          {positionLabel(item.position)} · {item.age} anos · OVR {item.overall}
        </Text>
      </View>
      <TouchableOpacity
        style={s.favoriteRemoveBtn}
        onPress={onRemove}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Ionicons name="star" size={18} color={Colors.warningDark} />
      </TouchableOpacity>
    </View>
  );
}

function SpotPaymentRow({
  payment, onConfirm, disabled,
}: {
  payment: SpotPayment;
  onConfirm: () => void;
  disabled: boolean;
}) {
  return (
    <View style={s.paymentRow}>
      <View style={{ flex: 1 }}>
        <Text style={s.paymentName} numberOfLines={1}>{payment.athleteName}</Text>
        <Text style={s.paymentMeta} numberOfLines={1}>
          {payment.matchLocation} · {formatCurrency(payment.amount)}
        </Text>
        {payment.paymentReportedAt && (
          <Text style={s.paymentReported}>Pagamento informado</Text>
        )}
      </View>
      <TouchableOpacity
        style={s.paymentConfirmBtn}
        onPress={onConfirm}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text style={s.paymentConfirmText}>Confirmar</Text>
      </TouchableOpacity>
    </View>
  );
}

function MatchCard({ match, onPress }: { match: GroupUpcomingMatch; onPress: () => void }) {
  const spotsLeft = match.totalVacancies - match.confirmedCount;
  return (
    <TouchableOpacity style={s.matchCard} onPress={onPress} activeOpacity={0.7}>
      <View style={s.matchDateBox}>
        <Text style={s.matchDay}>{formatDate(match.date).split(',')[0]?.toUpperCase()}</Text>
        <Text style={s.matchDayNum}>{new Date(match.date).getDate()}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.matchLocation} numberOfLines={1}>{match.location}</Text>
        <Text style={s.matchTime}>{formatTime(match.date)}</Text>
      </View>
      <View style={s.matchSpots}>
        <Text style={[s.matchSpotsNum, spotsLeft === 0 ? { color: Colors.error } : { color: Colors.success }]}>
          {match.confirmedCount}/{match.totalVacancies}
        </Text>
        <Text style={s.matchSpotsLabel}>confirmados</Text>
      </View>
    </TouchableOpacity>
  );
}

type ConfirmState = { title: string; msg: string; fn: () => Promise<unknown>; errMsg: string; destructive?: boolean };

function MemberOptionsModal({
  member, groupId, currentAthleteId, onClose, onRefresh,
}: {
  member: GroupMember | null;
  groupId: string;
  currentAthleteId: string;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

  if (!member) return null;

  async function callApi(fn: () => Promise<unknown>, errorMsg: string) {
    try { await fn(); onRefresh(); onClose(); setConfirmState(null); }
    catch { Alert.alert('Erro', errorMsg); }
  }

  function confirm(title: string, msg: string, fn: () => Promise<unknown>, errMsg: string, destructive = false) {
    setConfirmState({ title, msg, fn, errMsg, destructive });
  }

  if (confirmState) {
    return (
      <Modal transparent animationType="fade" visible onRequestClose={() => setConfirmState(null)}>
        <Pressable style={s.modalOverlay} onPress={() => setConfirmState(null)}>
          <Pressable style={s.modalSheet} onPress={(e) => e.stopPropagation()}>
            <Text style={s.modalTitle}>{confirmState.title}</Text>
            <Text style={s.modalSub}>{confirmState.msg}</Text>
            <View style={s.modalDivider} />
            <TouchableOpacity style={s.modalOption} onPress={() => callApi(confirmState.fn, confirmState.errMsg)} activeOpacity={0.7}>
              <Text style={[s.modalOptionText, confirmState.destructive && s.modalOptionDestructive]}>
                {confirmState.title}
              </Text>
            </TouchableOpacity>
            <View style={s.modalDivider} />
            <TouchableOpacity style={s.modalOption} onPress={() => setConfirmState(null)} activeOpacity={0.7}>
              <Text style={s.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    );
  }

  const options: { label: string; destructive?: boolean; onPress: () => void }[] = [
    {
      label: member.isAdmin ? 'Remover como administrador' : 'Tornar administrador',
      destructive: member.isAdmin,
      onPress: () => confirm(
        member.isAdmin ? 'Remover administrador' : 'Tornar administrador',
        member.isAdmin ? `Remover ${member.name} como administrador?` : `Tornar ${member.name} administrador?`,
        () => member.isAdmin
          ? groupApi.demoteAdmin(groupId, currentAthleteId, member.id)
          : groupApi.promoteAdmin(groupId, currentAthleteId, member.id),
        member.isAdmin ? 'Não foi possível remover o administrador.' : 'Não foi possível promover o membro.',
        member.isAdmin,
      ),
    },
    {
      label: member.isInjured ? 'Desmarcar lesão' : 'Marcar como lesionado',
      onPress: () => confirm(
        member.isInjured ? 'Desmarcar lesão' : 'Marcar como lesionado',
        member.isInjured ? `Marcar ${member.name} como recuperado?` : `Marcar ${member.name} como lesionado?`,
        () => groupApi.setInjured(groupId, currentAthleteId, member.id, !member.isInjured),
        member.isInjured ? 'Não foi possível desmarcar a lesão.' : 'Não foi possível marcar como lesionado.',
      ),
    },
    {
      label: member.isBlocked ? 'Ativar membro' : 'Bloquear',
      destructive: !member.isBlocked,
      onPress: () => confirm(
        member.isBlocked ? 'Ativar membro' : 'Bloquear',
        member.isBlocked ? `Reativar ${member.name}?` : `Bloquear ${member.name}?`,
        () => groupApi.setBlocked(groupId, currentAthleteId, member.id, !member.isBlocked),
        member.isBlocked ? 'Não foi possível ativar o membro.' : 'Não foi possível bloquear o membro.',
        !member.isBlocked,
      ),
    },
    {
      label: 'Excluir do grupo',
      destructive: true,
      onPress: () => confirm(
        'Excluir do grupo',
        `Remover ${member.name} do grupo permanentemente?`,
        () => groupApi.removeMember(groupId, currentAthleteId, member.id),
        'Não foi possível remover o membro.',
        true,
      ),
    },
  ];

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose}>
      <Pressable style={s.modalOverlay} onPress={onClose}>
        <Pressable style={s.modalSheet} onPress={(e) => e.stopPropagation()}>
          <Text style={s.modalTitle}>{member.name}</Text>
          <Text style={s.modalSub}>O que deseja fazer?</Text>
          <View style={s.modalDivider} />
          {options.map((opt) => (
            <TouchableOpacity key={opt.label} style={s.modalOption} onPress={opt.onPress} activeOpacity={0.7}>
              <Text style={[s.modalOptionText, opt.destructive && s.modalOptionDestructive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
          <View style={s.modalDivider} />
          <TouchableOpacity style={s.modalOption} onPress={onClose} activeOpacity={0.7}>
            <Text style={s.modalCancelText}>Cancelar</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function MemberProfileModal({ member, onClose }: { member: GroupMember | null; onClose: () => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ['athlete-dashboard', member?.id],
    queryFn: () => athleteApi.dashboard(member!.id),
    enabled: !!member,
    staleTime: 60_000,
  });

  if (!member) return null;

  const stats = data?.averageStats;
  const statItems = stats ? [
    { label: 'Velocidade', value: stats.pace },
    { label: 'Finalização', value: stats.shooting },
    { label: 'Passe',      value: stats.passing },
    { label: 'Drible',     value: stats.dribbling },
    { label: 'Defesa',     value: stats.defense },
    { label: 'Físico',     value: stats.physical },
  ] : [];

  function statColor(v: number) {
    if (v >= 75) return Colors.success;
    if (v >= 50) return Colors.warning;
    return Colors.error;
  }

  return (
    <Modal transparent statusBarTranslucent animationType="slide" visible onRequestClose={onClose}>
      <Pressable style={s.profileOverlay} onPress={onClose}>
        <Pressable style={s.profileSheet} onPress={(e) => e.stopPropagation()}>
          {/* handle */}
          <View style={s.profileHandle} />

          {/* avatar + nome */}
          <View style={s.profileHeader}>
            <View style={[s.profileAvatar, member.isAdmin && s.memberAvatarAdmin]}>
              <Text style={[s.profileAvatarText, member.isAdmin && s.memberAvatarTextAdmin]}>
                {member.name.slice(0, 2).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={s.profileName}>{member.name}</Text>
                {member.isAdmin && (
                  <View style={s.adminBadge}><Text style={s.adminBadgeText}>Admin</Text></View>
                )}
              </View>
              <View style={[s.posTag, { marginTop: 4, alignSelf: 'flex-start' }]}>
                <Text style={s.posTagText}>{positionLabel(member.position)}</Text>
              </View>
            </View>
            {/* OVR */}
            <View style={s.profileOvr}>
              <Text style={s.profileOvrNum}>{member.overall}</Text>
              <Text style={s.profileOvrLbl}>OVR</Text>
            </View>
          </View>

          {/* status badges */}
          <View style={s.profileBadges}>
            <View style={[s.profileBadge, { backgroundColor: member.hasDebt ? Colors.errorLight : Colors.successLight }]}>
              <Ionicons name={member.hasDebt ? 'alert-circle' : 'checkmark-circle'} size={13}
                color={member.hasDebt ? Colors.errorDark : Colors.successDark} />
              <Text style={[s.profileBadgeText, { color: member.hasDebt ? Colors.errorDark : Colors.successDark }]}>
                {member.hasDebt ? 'Pagamento pendente' : 'Pagamento em dia'}
              </Text>
            </View>
            <View style={[s.profileBadge, { backgroundColor: member.isInjured ? Colors.warningLight : Colors.successLight }]}>
              <Ionicons name={member.isInjured ? 'bandage' : 'fitness'} size={13}
                color={member.isInjured ? Colors.warningDark : Colors.successDark} />
              <Text style={[s.profileBadgeText, { color: member.isInjured ? Colors.warningDark : Colors.successDark }]}>
                {member.isInjured ? 'Lesionado' : 'Apto'}
              </Text>
            </View>
            {member.isBlocked && (
              <View style={[s.profileBadge, { backgroundColor: Colors.n200 }]}>
                <Ionicons name="ban" size={13} color={Colors.n700} />
                <Text style={[s.profileBadgeText, { color: Colors.n700 }]}>Bloqueado</Text>
              </View>
            )}
          </View>

          {/* stats */}
          <View style={s.profileStats}>
            <Text style={s.profileStatsTitle}>Atributos técnicos</Text>
            {isLoading ? (
              <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 12 }} />
            ) : statItems.length === 0 ? (
              <Text style={s.profileNoStats}>Sem partidas avaliadas ainda</Text>
            ) : (
              statItems.map(({ label, value }) => (
                <View key={label} style={s.statRow}>
                  <Text style={s.statLabel}>{label}</Text>
                  <View style={s.statBarBg}>
                    <View style={[s.statBarFill, { width: `${value}%` as any, backgroundColor: statColor(value) }]} />
                  </View>
                  <Text style={[s.statValue, { color: statColor(value) }]}>{value}</Text>
                </View>
              ))
            )}
          </View>

          <TouchableOpacity style={s.profileCloseBtn} onPress={onClose} activeOpacity={0.7}>
            <Text style={s.profileCloseBtnText}>Fechar</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function MemberRow({
  member, isAdmin, onPress, onOptions,
}: {
  member: GroupMember;
  isAdmin: boolean;
  onPress: () => void;
  onOptions?: () => void;
}) {
  return (
    <TouchableOpacity style={s.memberRow} onPress={onPress} activeOpacity={0.7}>
      <View style={[s.memberAvatar, member.isAdmin ? s.memberAvatarAdmin : null]}>
        <Text style={[s.memberAvatarText, member.isAdmin ? s.memberAvatarTextAdmin : null]}>
          {member.name.slice(0, 2).toUpperCase()}
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        <View style={s.memberNameRow}>
          <Text style={s.memberName} numberOfLines={1}>{member.name}</Text>
          {member.isAdmin && (
            <View style={s.adminBadge}>
              <Text style={s.adminBadgeText}>Admin</Text>
            </View>
          )}
        </View>
        <View style={s.memberMeta}>
          <View style={s.posTag}>
            <Text style={s.posTagText}>{positionLabel(member.position)}</Text>
          </View>
          <Text style={s.memberOverall}>OVR {member.overall}</Text>
          {member.isInjured && (
            <View style={[s.statusTag, { backgroundColor: Colors.warningLight }]}>
              <Text style={[s.statusTagText, { color: Colors.warningDark }]}>Lesionado</Text>
            </View>
          )}
          {member.isBlocked && (
            <View style={[s.statusTag, { backgroundColor: Colors.n200 }]}>
              <Text style={[s.statusTagText, { color: Colors.n700 }]}>Bloqueado</Text>
            </View>
          )}
          {member.hasDebt && (
            <View style={[s.statusTag, { backgroundColor: Colors.errorLight }]}>
              <Text style={[s.statusTagText, { color: Colors.errorDark }]}>Devedor</Text>
            </View>
          )}
        </View>
      </View>

      {onOptions && (
        <TouchableOpacity onPress={onOptions} hitSlop={12} activeOpacity={0.7}>
          <Ionicons name="ellipsis-vertical" size={16} color={Colors.n400} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe:               { flex: 1, backgroundColor: Colors.n50 },
  center:             { justifyContent: 'center', alignItems: 'center', gap: 8 },
  errorText:          { fontSize: 14, color: Colors.n700 },
  retryBtn:           { marginTop: 8, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: Colors.primary, borderRadius: Radius.r8 },
  retryText:          { color: Colors.white, fontWeight: '600' },

  // Header
  header:             { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.n200, gap: 12 },
  backBtn:            { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.n100, alignItems: 'center', justifyContent: 'center' },
  headerTitle:        { fontSize: 16, fontWeight: '800', color: Colors.n900 },
  headerSub:          { fontSize: 11, color: Colors.n500 },
  editBtn:            { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.n100, alignItems: 'center', justifyContent: 'center' },

  // Quick actions
  actionsRow:         { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: Colors.white, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.n200 },
  quickAction:        { alignItems: 'center', gap: 6, minWidth: 64 },
  quickActionIcon:    { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  quickActionLabel:   { fontSize: 11, fontWeight: '600', color: Colors.n700 },

  // Section
  section:            { marginTop: Spacing.lg, paddingHorizontal: Spacing.lg },
  sectionHeader:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle:       { fontSize: 14, fontWeight: '800', color: Colors.n900 },
  inviteBtn:          { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primaryLight, borderRadius: Radius.r999, paddingHorizontal: 10, paddingVertical: 4 },
  inviteBtnText:      { fontSize: 12, fontWeight: '600', color: Colors.primary },

  // Balance
  balanceCard:        { flexDirection: 'row', backgroundColor: Colors.white, borderRadius: Radius.r12, borderWidth: 1, borderColor: Colors.n200, overflow: 'hidden' },
  balanceItem:        { flex: 1, alignItems: 'center', paddingVertical: 14, gap: 4 },
  balanceDivider:     { width: 1, backgroundColor: Colors.n200 },
  balanceLabel:       { fontSize: 11, color: Colors.n500 },
  balanceValue:       { fontSize: 15, fontWeight: '800', color: Colors.n900 },

  // Match card
  matchCard:          { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.r12, borderWidth: 1, borderColor: Colors.n200, padding: Spacing.md, marginBottom: 8, gap: 12 },
  matchDateBox:       { width: 44, alignItems: 'center', backgroundColor: Colors.primaryLight, borderRadius: Radius.r8, paddingVertical: 6 },
  matchDay:           { fontSize: 9, fontWeight: '700', color: Colors.primary },
  matchDayNum:        { fontSize: 18, fontWeight: '800', color: Colors.primary },
  matchLocation:      { fontSize: 13, fontWeight: '600', color: Colors.n900 },
  matchTime:          { fontSize: 11, color: Colors.n500, marginTop: 2 },
  matchSpots:         { alignItems: 'center' },
  matchSpotsNum:      { fontSize: 14, fontWeight: '800' },
  matchSpotsLabel:    { fontSize: 10, color: Colors.n500 },

  // Empty
  emptyCard:          { alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.r12, borderWidth: 1, borderColor: Colors.n200, paddingVertical: 24, gap: 8 },
  emptyText:          { fontSize: 13, color: Colors.n500 },
  emptyAction:        { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: Colors.primary, borderRadius: Radius.r8 },
  emptyActionText:    { color: Colors.white, fontWeight: '600', fontSize: 13 },

  // Favorite spot athletes
  favoriteRow:        { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.r12, borderWidth: 1, borderColor: Colors.n200, padding: Spacing.md, marginBottom: 6, gap: 10 },
  favoriteAvatar:     { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.warningLight, alignItems: 'center', justifyContent: 'center' },
  favoriteAvatarText: { fontSize: 13, fontWeight: '800', color: Colors.warningDark },
  favoriteName:       { fontSize: 13, fontWeight: '700', color: Colors.n900 },
  favoriteMeta:       { fontSize: 11, color: Colors.n500, marginTop: 2 },
  favoriteRemoveBtn:  { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.warningLight, alignItems: 'center', justifyContent: 'center' },

  paymentRow:         { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.r12, borderWidth: 1, borderColor: Colors.n200, padding: Spacing.md, marginBottom: 6, gap: 10 },
  paymentName:        { fontSize: 13, fontWeight: '700', color: Colors.n900 },
  paymentMeta:        { fontSize: 11, color: Colors.n500, marginTop: 2 },
  paymentReported:    { fontSize: 11, fontWeight: '700', color: Colors.warningDark, marginTop: 3 },
  paymentConfirmBtn:  { backgroundColor: Colors.successLight, borderRadius: Radius.r8, paddingHorizontal: 10, paddingVertical: 7 },
  paymentConfirmText: { fontSize: 12, fontWeight: '700', color: Colors.successDark },

  // Modal
  modalOverlay:       { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  profileOverlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalSheet:         { backgroundColor: Colors.white, borderRadius: Radius.r16, width: '100%', overflow: 'hidden' },
  modalTitle:         { fontSize: 16, fontWeight: '700', color: Colors.n900, textAlign: 'center', paddingTop: 20, paddingHorizontal: 16 },
  modalSub:           { fontSize: 13, color: Colors.n500, textAlign: 'center', paddingBottom: 12, paddingHorizontal: 16 },
  modalDivider:       { height: 1, backgroundColor: Colors.n200 },
  modalOption:        { paddingVertical: 16, paddingHorizontal: 20, alignItems: 'center' },
  modalOptionText:    { fontSize: 14, fontWeight: '600', color: Colors.primary },
  modalOptionDestructive: { color: Colors.error },
  modalCancelText:    { fontSize: 14, fontWeight: '600', color: Colors.n500 },

  // Profile modal
  profileSheet:       { backgroundColor: Colors.white, borderTopLeftRadius: Radius.r24, borderTopRightRadius: Radius.r24, paddingHorizontal: Spacing.lg, paddingBottom: 32 },
  profileHandle:      { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.n300, alignSelf: 'center', marginTop: 10, marginBottom: 16 },
  profileHeader:      { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  profileAvatar:      { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.n200, alignItems: 'center', justifyContent: 'center' },
  profileAvatarText:  { fontSize: 18, fontWeight: '800', color: Colors.n700 },
  profileName:        { fontSize: 16, fontWeight: '800', color: Colors.n900 },
  profileOvr:         { alignItems: 'center', backgroundColor: Colors.primary, borderRadius: Radius.r999, paddingHorizontal: 12, paddingVertical: 6 },
  profileOvrNum:      { fontSize: 18, fontWeight: '800', color: Colors.white, lineHeight: 20 },
  profileOvrLbl:      { fontSize: 9, fontWeight: '600', color: Colors.white },
  profileBadges:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  profileBadge:       { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: Radius.r999, paddingHorizontal: 10, paddingVertical: 5 },
  profileBadgeText:   { fontSize: 12, fontWeight: '600' },
  profileStats:       { marginBottom: 20 },
  profileStatsTitle:  { fontSize: 12, fontWeight: '700', color: Colors.n500, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  profileNoStats:     { fontSize: 13, color: Colors.n400, textAlign: 'center', paddingVertical: 8 },
  statRow:            { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  statLabel:          { fontSize: 12, color: Colors.n500, width: 80 },
  statBarBg:          { flex: 1, height: 6, backgroundColor: Colors.n200, borderRadius: Radius.r999, overflow: 'hidden' },
  statBarFill:        { height: '100%', borderRadius: Radius.r999 },
  statValue:          { fontSize: 12, fontWeight: '700', width: 24, textAlign: 'right' },
  profileCloseBtn:    { backgroundColor: Colors.n100, borderRadius: Radius.r12, paddingVertical: 13, alignItems: 'center' },
  profileCloseBtnText:{ fontSize: 14, fontWeight: '700', color: Colors.n700 },

  // Members
  memberGroupLabel:   { fontSize: 11, fontWeight: '700', color: Colors.n500, marginTop: 8, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  memberRow:          { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.r12, borderWidth: 1, borderColor: Colors.n200, padding: Spacing.md, marginBottom: 6, gap: 10 },
  memberAvatar:       { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.n200, alignItems: 'center', justifyContent: 'center' },
  memberAvatarAdmin:  { backgroundColor: Colors.primary },
  memberAvatarText:   { fontSize: 13, fontWeight: '800', color: Colors.n700 },
  memberAvatarTextAdmin: { color: Colors.white },
  memberNameRow:      { flexDirection: 'row', alignItems: 'center', gap: 6 },
  memberName:         { fontSize: 13, fontWeight: '600', color: Colors.n900, flexShrink: 1 },
  adminBadge:         { backgroundColor: Colors.primaryLight, borderRadius: Radius.r4, paddingHorizontal: 6, paddingVertical: 2 },
  adminBadgeText:     { fontSize: 10, fontWeight: '700', color: Colors.primary },
  memberMeta:         { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3, flexWrap: 'wrap' },
  posTag:             { backgroundColor: Colors.n100, borderRadius: Radius.r4, paddingHorizontal: 5, paddingVertical: 2 },
  posTagText:         { fontSize: 10, fontWeight: '700', color: Colors.n700 },
  memberOverall:      { fontSize: 11, color: Colors.n500 },
  statusTag:          { borderRadius: Radius.r4, paddingHorizontal: 5, paddingVertical: 2 },
  statusTagText:      { fontSize: 10, fontWeight: '600' },
});
