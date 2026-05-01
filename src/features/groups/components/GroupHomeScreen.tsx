import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  SafeAreaView, ActivityIndicator, RefreshControl, Alert, Modal, Pressable,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '../../common/theme';
import { groupApi } from '../services/groupApi';
import { useAuthStore } from '../../auth/useAuthStore';
import { GroupMember, GroupUpcomingMatch } from '../groupTypes';

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
  const [membersExpanded, setMembersExpanded] = useState(true);
  const [selectedMember, setSelectedMember] = useState<GroupMember | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['group-home', groupId],
    queryFn: () => groupApi.getHome(groupId!, athleteId),
    enabled: !!groupId && !!athleteId,
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
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={20} color={Colors.n900} />
        </TouchableOpacity>
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
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} colors={[Colors.primary]} />}
      >

        {/* ── QUICK ACTIONS ── */}
        <View style={s.actionsRow}>
          <QuickAction
            icon="person-add-outline"
            label="Convidar"
            onPress={() => router.push({ pathname: '/invite-athlete', params: { groupId, groupName: group.name } } as any)}
          />
          <QuickAction
            icon="football-outline"
            label="Nova partida"
            onPress={() => router.push({ pathname: '/create-match', params: { groupId } } as any)}
          />
          {isAdmin && (
            <QuickAction
              icon="people-outline"
              label="Membros"
              onPress={() => setMembersExpanded((v) => !v)}
            />
          )}
          {isAdmin && (
            <QuickAction
              icon="wallet-outline"
              label="Financeiro"
              onPress={() => router.push({ pathname: '/group-finance', params: { groupId } } as any)}
            />
          )}
        </View>

        {/* ── BALANCE CARD (admin only) ── */}
        {isAdmin && balance && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Caixa do grupo</Text>
            <View style={s.balanceCard}>
              <View style={s.balanceItem}>
                <Text style={s.balanceLabel}>Em caixa</Text>
                <Text style={[s.balanceValue, { color: Colors.success }]}>
                  {formatCurrency(balance.cashInHand)}
                </Text>
              </View>
              <View style={s.balanceDivider} />
              <View style={s.balanceItem}>
                <Text style={s.balanceLabel}>Pendente</Text>
                <Text style={[s.balanceValue, { color: Colors.warning }]}>
                  {formatCurrency(balance.totalPending)}
                </Text>
              </View>
              <View style={s.balanceDivider} />
              <View style={s.balanceItem}>
                <Text style={s.balanceLabel}>Mensalidade</Text>
                <Text style={s.balanceValue}>{formatCurrency(group.monthlyFee)}</Text>
              </View>
            </View>
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
              <MatchCard key={match.id} match={match} onPress={() => {}} />
            ))
          )}
        </View>

        {/* ── MEMBER OPTIONS MODAL ── */}
        <MemberOptionsModal
          member={selectedMember}
          groupId={groupId!}
          currentAthleteId={athleteId}
          onClose={() => setSelectedMember(null)}
          onRefresh={refetch}
        />

        {/* ── MEMBERS ── */}
        <View style={s.section}>
          <TouchableOpacity
            style={s.sectionHeader}
            onPress={() => setMembersExpanded((v) => !v)}
            activeOpacity={0.7}
          >
            <Text style={s.sectionTitle}>Membros ({members.length})</Text>
            <View style={s.sectionHeaderRight}>
              {isAdmin && (
                <TouchableOpacity
                  style={s.inviteBtn}
                  onPress={() => router.push({ pathname: '/invite-athlete', params: { groupId, groupName: group.name } } as any)}
                >
                  <Ionicons name="person-add-outline" size={14} color={Colors.primary} />
                  <Text style={s.inviteBtnText}>Convidar</Text>
                </TouchableOpacity>
              )}
              <Ionicons
                name={membersExpanded ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={Colors.n500}
              />
            </View>
          </TouchableOpacity>

          {membersExpanded && (
            <>
              {activeMembers.map((m) => (
                <MemberRow key={m.id} member={m} isAdmin={isAdmin} onPress={() => isAdmin && m.id !== athleteId ? setSelectedMember(m) : undefined} />
              ))}
              {blockedMembers.length > 0 && (
                <>
                  <Text style={s.memberGroupLabel}>Bloqueados</Text>
                  {blockedMembers.map((m) => (
                    <MemberRow key={m.id} member={m} isAdmin={isAdmin} onPress={() => isAdmin && m.id !== athleteId ? setSelectedMember(m) : undefined} />
                  ))}
                </>
              )}
            </>
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
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

function MemberRow({
  member, isAdmin, onPress,
}: {
  member: GroupMember;
  isAdmin: boolean;
  onPress?: () => void;
}) {
  const canManage = isAdmin && !!onPress;

  return (
    <TouchableOpacity
      style={s.memberRow}
      onPress={onPress}
      activeOpacity={canManage ? 0.7 : 1}
    >
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

      {canManage && (
        <Ionicons name="ellipsis-vertical" size={16} color={Colors.n400} />
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
  sectionHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
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

  // Modal
  modalOverlay:       { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalSheet:         { backgroundColor: Colors.white, borderRadius: Radius.r16, width: '100%', overflow: 'hidden' },
  modalTitle:         { fontSize: 16, fontWeight: '700', color: Colors.n900, textAlign: 'center', paddingTop: 20, paddingHorizontal: 16 },
  modalSub:           { fontSize: 13, color: Colors.n500, textAlign: 'center', paddingBottom: 12, paddingHorizontal: 16 },
  modalDivider:       { height: 1, backgroundColor: Colors.n200 },
  modalOption:        { paddingVertical: 16, paddingHorizontal: 20, alignItems: 'center' },
  modalOptionText:    { fontSize: 14, fontWeight: '600', color: Colors.primary },
  modalOptionDestructive: { color: Colors.error },
  modalCancelText:    { fontSize: 14, fontWeight: '600', color: Colors.n500 },

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
