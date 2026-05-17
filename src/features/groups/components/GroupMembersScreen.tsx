import React, { useState } from 'react';
import {
  ActivityIndicator, Alert, Modal, Pressable, RefreshControl, SafeAreaView,
  ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { BackButton } from '../../common/components/BackButton';
import { Colors, Radius, Spacing } from '../../common/theme';
import { realtime } from '../../../lib/realtime';
import { useAuthStore } from '../../auth/useAuthStore';
import { groupApi } from '../services/groupApi';
import { FavoriteSpotAthlete, GroupMember } from '../groupTypes';
import { GroupTopMenu } from './GroupTopMenu';

type MembersTab = 'members' | 'spot';
type ConfirmState = { title: string; msg: string; fn: () => Promise<unknown>; errMsg: string; destructive?: boolean };

function positionLabel(pos: string) {
  const map: Record<string, string> = {
    Goalkeeper: 'GOL', Defender: 'ZAG', Midfielder: 'MEI', Forward: 'ATA', Undefined: '-',
  };
  return map[pos] ?? pos.slice(0, 3).toUpperCase();
}

function normalizeStat(value: unknown) {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(100, Math.round(numeric)));
}

export default function GroupMembersScreen() {
  const { groupId, tab } = useLocalSearchParams<{ groupId: string; tab?: MembersTab }>();
  const router = useRouter();
  const qc = useQueryClient();
  const athleteId = useAuthStore((s) => s.athleteId) ?? '';
  const [activeTab, setActiveTab] = useState<MembersTab>(tab === 'spot' ? 'spot' : 'members');
  const [selectedMember, setSelectedMember] = useState<GroupMember | null>(null);
  const [profileMember, setProfileMember] = useState<GroupMember | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['group-home', groupId],
    queryFn: () => groupApi.getHome(groupId!, athleteId),
    enabled: !!groupId && !!athleteId,
    refetchInterval: realtime.sharedStateMs,
  });

  const { data: favoriteSpotAthletes = [] } = useQuery({
    queryKey: ['favorite-spot-athletes', groupId],
    queryFn: () => groupApi.listFavoriteSpotAthletes(groupId!, athleteId),
    enabled: !!groupId && !!athleteId && data?.isAdmin === true,
    refetchInterval: realtime.sharedStateMs,
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: (targetAthleteId: string) => groupApi.unfavoriteSpotAthlete(groupId!, athleteId, targetAthleteId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['favorite-spot-athletes', groupId] });
      qc.invalidateQueries({ queryKey: ['nearby-athletes-all'] });
    },
    onError: () => Alert.alert('Erro', 'Nao foi possivel remover o favorito.'),
  });

  if (isLoading) {
    return (
      <SafeAreaView style={[s.safe, s.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (isError || !data) {
    const isForbidden = (error as any)?.response?.status === 403;
    return (
      <SafeAreaView style={[s.safe, s.center]}>
        <Ionicons name="alert-circle-outline" size={40} color={Colors.error} />
        <Text style={s.errorText}>{isForbidden ? 'Voce nao tem acesso a este grupo' : 'Erro ao carregar membros'}</Text>
        <TouchableOpacity style={s.primaryBtn} onPress={() => (isForbidden ? router.back() : refetch())}>
          <Text style={s.primaryBtnText}>{isForbidden ? 'Voltar' : 'Tentar novamente'}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const { group, isAdmin, members } = data;
  const effectiveTab = activeTab === 'spot' && !isAdmin ? 'members' : activeTab;
  const activeMembers = members.filter((m) => !m.hasDebt && !m.isInjured && !m.isBlocked);
  const blockedMembers = members.filter((m) => m.hasDebt || m.isInjured || m.isBlocked);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <BackButton />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={s.headerTitle}>Membros</Text>
          <Text style={s.headerSub} numberOfLines={1}>{group.name}</Text>
        </View>
      </View>

      <GroupTopMenu groupId={groupId!} active="members" showFinance={isAdmin} />

      <View style={s.tabs}>
        <TabButton label={`Membros (${members.length})`} active={effectiveTab === 'members'} onPress={() => setActiveTab('members')} />
        {isAdmin && (
          <TabButton label={`Avulsos (${favoriteSpotAthletes.length})`} active={effectiveTab === 'spot'} onPress={() => setActiveTab('spot')} />
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} colors={[Colors.primary]} />}
        contentContainerStyle={s.scroll}
      >
        {effectiveTab === 'members' && (
          <View>
            {activeMembers.map((member) => (
              <MemberRow
                key={member.id}
                member={member}
                onPress={() => setProfileMember(member)}
                onOptions={isAdmin && member.id !== athleteId ? () => setSelectedMember(member) : undefined}
              />
            ))}
            {blockedMembers.length > 0 && (
              <>
                <Text style={s.groupLabel}>Com alerta</Text>
                {blockedMembers.map((member) => (
                  <MemberRow
                    key={member.id}
                    member={member}
                    onPress={() => setProfileMember(member)}
                    onOptions={isAdmin && member.id !== athleteId ? () => setSelectedMember(member) : undefined}
                  />
                ))}
              </>
            )}
          </View>
        )}

        {effectiveTab === 'spot' && isAdmin && (
          <View>
            {favoriteSpotAthletes.length === 0 ? (
              <View style={s.emptyCard}>
                <Ionicons name="star-outline" size={34} color={Colors.n300} />
                <Text style={s.emptyText}>Nenhum avulso favorito ainda</Text>
              </View>
            ) : favoriteSpotAthletes.map((item) => (
              <FavoriteSpotAthleteRow
                key={item.athleteId}
                item={item}
                disabled={removeFavoriteMutation.isPending}
                onRemove={() => removeFavoriteMutation.mutate(item.athleteId)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <MemberProfileModal member={profileMember} onClose={() => setProfileMember(null)} />
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

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[s.tabBtn, active && s.tabBtnActive]} onPress={onPress} activeOpacity={0.7}>
      <Text style={[s.tabText, active && s.tabTextActive]}>{label}</Text>
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
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={s.favoriteName} numberOfLines={1}>{item.name}</Text>
        <Text style={s.favoriteMeta}>{positionLabel(item.position)} - {item.age} anos - OVR {item.overall}</Text>
      </View>
      <TouchableOpacity style={s.favoriteRemoveBtn} onPress={onRemove} disabled={disabled} activeOpacity={0.7}>
        <Ionicons name="star" size={18} color={Colors.warningDark} />
      </TouchableOpacity>
    </View>
  );
}

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
    try {
      await fn();
      onRefresh();
      onClose();
      setConfirmState(null);
    } catch {
      Alert.alert('Erro', errorMsg);
    }
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
              <Text style={[s.modalOptionText, confirmState.destructive && s.modalOptionDestructive]}>{confirmState.title}</Text>
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
      label: member.isAdmin ? 'Remover admin' : 'Tornar admin',
      onPress: () => confirm(
        member.isAdmin ? 'Remover admin' : 'Tornar admin',
        member.isAdmin ? `Remover permissao de admin de ${member.name}?` : `Tornar ${member.name} admin do grupo?`,
        () => member.isAdmin
          ? groupApi.demoteAdmin(groupId, currentAthleteId, member.id)
          : groupApi.promoteAdmin(groupId, currentAthleteId, member.id),
        'Nao foi possivel alterar admin.',
      ),
    },
    {
      label: member.isInjured ? 'Marcar como apto' : 'Marcar lesionado',
      onPress: () => confirm(
        member.isInjured ? 'Marcar como apto' : 'Marcar lesionado',
        member.isInjured ? `Marcar ${member.name} como apto?` : `Marcar ${member.name} como lesionado?`,
        () => groupApi.setInjured(groupId, currentAthleteId, member.id, !member.isInjured),
        'Nao foi possivel alterar lesao.',
      ),
    },
    {
      label: member.isBlocked ? 'Reativar membro' : 'Bloquear membro',
      destructive: !member.isBlocked,
      onPress: () => confirm(
        member.isBlocked ? 'Reativar membro' : 'Bloquear membro',
        member.isBlocked ? `Reativar ${member.name}?` : `Bloquear ${member.name}?`,
        () => groupApi.setBlocked(groupId, currentAthleteId, member.id, !member.isBlocked),
        member.isBlocked ? 'Nao foi possivel ativar o membro.' : 'Nao foi possivel bloquear o membro.',
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
        'Nao foi possivel remover o membro.',
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
              <Text style={[s.modalOptionText, opt.destructive && s.modalOptionDestructive]}>{opt.label}</Text>
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
  if (!member) return null;

  const stats = member.averageStats;
  const statItems = stats ? [
    { label: 'Velocidade', value: normalizeStat(stats.pace) },
    { label: 'Finalizacao', value: normalizeStat(stats.shooting) },
    { label: 'Passe', value: normalizeStat(stats.passing) },
    { label: 'Drible', value: normalizeStat(stats.dribbling) },
    { label: 'Defesa', value: normalizeStat(stats.defense) },
    { label: 'Fisico', value: normalizeStat(stats.physical) },
  ] : [];

  return (
    <Modal transparent statusBarTranslucent animationType="slide" visible onRequestClose={onClose}>
      <Pressable style={s.profileOverlay} onPress={onClose}>
        <Pressable style={s.profileSheet} onPress={(e) => e.stopPropagation()}>
          <View style={s.profileHandle} />
          <View style={s.profileHeader}>
            <View style={[s.profileAvatar, member.isAdmin && s.memberAvatarAdmin]}>
              <Text style={[s.profileAvatarText, member.isAdmin && s.memberAvatarTextAdmin]}>
                {member.name.slice(0, 2).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={s.profileName} numberOfLines={1}>{member.name}</Text>
              <View style={[s.posTag, { alignSelf: 'flex-start', marginTop: 4 }]}>
                <Text style={s.posTagText}>{positionLabel(member.position)}</Text>
              </View>
            </View>
            <View style={s.profileOvr}>
              <Text style={s.profileOvrNum}>{member.overall}</Text>
              <Text style={s.profileOvrLbl}>OVR</Text>
            </View>
          </View>
          <Text style={s.profileStatsTitle}>Atributos tecnicos</Text>
          {statItems.length === 0 ? (
            <Text style={s.profileNoStats}>Sem partidas avaliadas ainda</Text>
          ) : statItems.map(({ label, value }) => (
            <View key={label} style={s.statRow}>
              <Text style={s.statLabel}>{label}</Text>
              <View style={s.statBarBg}>
                <View style={[s.statBarFill, { width: `${value}%` }]} />
              </View>
              <Text style={s.statValue} numberOfLines={1}>{value}/100</Text>
            </View>
          ))}
          <TouchableOpacity style={s.profileCloseBtn} onPress={onClose} activeOpacity={0.7}>
            <Text style={s.profileCloseBtnText}>Fechar</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function MemberRow({
  member, onPress, onOptions,
}: {
  member: GroupMember;
  onPress: () => void;
  onOptions?: () => void;
}) {
  return (
    <TouchableOpacity style={s.memberRow} onPress={onPress} activeOpacity={0.7}>
      <View style={[s.memberAvatar, member.isAdmin && s.memberAvatarAdmin]}>
        <Text style={[s.memberAvatarText, member.isAdmin && s.memberAvatarTextAdmin]}>
          {member.name.slice(0, 2).toUpperCase()}
        </Text>
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={s.memberNameRow}>
          <Text style={s.memberName} numberOfLines={1}>{member.name}</Text>
          {member.isAdmin && <View style={s.adminBadge}><Text style={s.adminBadgeText}>Admin</Text></View>}
        </View>
        <View style={s.memberMeta}>
          <View style={s.posTag}><Text style={s.posTagText}>{positionLabel(member.position)}</Text></View>
          <Text style={s.memberOverall}>OVR {member.overall}</Text>
          {member.isInjured && <StatusTag label="Lesionado" tone="warning" />}
          {member.isBlocked && <StatusTag label="Bloqueado" tone="neutral" />}
          {member.hasDebt && <StatusTag label="Devedor" tone="error" />}
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

function StatusTag({ label, tone }: { label: string; tone: 'warning' | 'error' | 'neutral' }) {
  const bg = tone === 'warning' ? Colors.warningLight : tone === 'error' ? Colors.errorLight : Colors.n200;
  const color = tone === 'warning' ? Colors.warningDark : tone === 'error' ? Colors.errorDark : Colors.n700;
  return (
    <View style={[s.statusTag, { backgroundColor: bg }]}>
      <Text style={[s.statusTagText, { color }]}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.n50 },
  center: { justifyContent: 'center', alignItems: 'center', gap: 8 },
  errorText: { fontSize: 14, color: Colors.n700 },
  primaryBtn: { marginTop: 8, paddingHorizontal: 18, paddingVertical: 10, backgroundColor: Colors.primary, borderRadius: Radius.r8 },
  primaryBtnText: { color: Colors.white, fontWeight: '700', fontSize: 13 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.n200, gap: 12 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: Colors.n900 },
  headerSub: { fontSize: 11, color: Colors.n500 },
  tabs: { flexDirection: 'row', margin: Spacing.lg, backgroundColor: Colors.n100, borderRadius: Radius.r12, padding: 4 },
  tabBtn: { flex: 1, alignItems: 'center', borderRadius: Radius.r8, paddingVertical: 10 },
  tabBtnActive: { backgroundColor: Colors.white },
  tabText: { fontSize: 12, fontWeight: '700', color: Colors.n500 },
  tabTextActive: { color: Colors.primary },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: 28 },
  groupLabel: { fontSize: 11, fontWeight: '800', color: Colors.n500, marginTop: 10, marginBottom: 6, textTransform: 'uppercase' },
  emptyCard: { alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.r12, borderWidth: 1, borderColor: Colors.n200, paddingVertical: 26, gap: 8 },
  emptyText: { fontSize: 13, color: Colors.n500 },
  favoriteRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.r12, borderWidth: 1, borderColor: Colors.n200, padding: Spacing.md, marginBottom: 7, gap: 10 },
  favoriteAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.warningLight, alignItems: 'center', justifyContent: 'center' },
  favoriteAvatarText: { fontSize: 13, fontWeight: '800', color: Colors.warningDark },
  favoriteName: { fontSize: 13, fontWeight: '700', color: Colors.n900 },
  favoriteMeta: { fontSize: 11, color: Colors.n500, marginTop: 2 },
  favoriteRemoveBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.warningLight, alignItems: 'center', justifyContent: 'center' },
  memberRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.r12, borderWidth: 1, borderColor: Colors.n200, padding: Spacing.md, marginBottom: 7, gap: 10 },
  memberAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.n200, alignItems: 'center', justifyContent: 'center' },
  memberAvatarAdmin: { backgroundColor: Colors.primary },
  memberAvatarText: { fontSize: 13, fontWeight: '800', color: Colors.n700 },
  memberAvatarTextAdmin: { color: Colors.white },
  memberNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  memberName: { fontSize: 13, fontWeight: '700', color: Colors.n900, flexShrink: 1 },
  memberMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3, flexWrap: 'wrap' },
  memberOverall: { fontSize: 11, color: Colors.n500 },
  adminBadge: { backgroundColor: Colors.primaryLight, borderRadius: Radius.r4, paddingHorizontal: 6, paddingVertical: 2 },
  adminBadgeText: { fontSize: 10, fontWeight: '700', color: Colors.primary },
  posTag: { backgroundColor: Colors.n100, borderRadius: Radius.r4, paddingHorizontal: 5, paddingVertical: 2 },
  posTagText: { fontSize: 10, fontWeight: '700', color: Colors.n700 },
  statusTag: { borderRadius: Radius.r4, paddingHorizontal: 5, paddingVertical: 2 },
  statusTagText: { fontSize: 10, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalSheet: { backgroundColor: Colors.white, borderRadius: Radius.r16, width: '100%', overflow: 'hidden' },
  modalTitle: { fontSize: 16, fontWeight: '800', color: Colors.n900, textAlign: 'center', paddingTop: 20, paddingHorizontal: 16 },
  modalSub: { fontSize: 13, color: Colors.n500, textAlign: 'center', paddingBottom: 12, paddingHorizontal: 16 },
  modalDivider: { height: 1, backgroundColor: Colors.n200 },
  modalOption: { paddingVertical: 16, paddingHorizontal: 20, alignItems: 'center' },
  modalOptionText: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  modalOptionDestructive: { color: Colors.error },
  modalCancelText: { fontSize: 14, fontWeight: '700', color: Colors.n500 },
  profileOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  profileSheet: { backgroundColor: Colors.white, borderTopLeftRadius: Radius.r24, borderTopRightRadius: Radius.r24, paddingHorizontal: Spacing.lg, paddingBottom: 32 },
  profileHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.n300, alignSelf: 'center', marginTop: 10, marginBottom: 16 },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  profileAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.n200, alignItems: 'center', justifyContent: 'center' },
  profileAvatarText: { fontSize: 18, fontWeight: '800', color: Colors.n700 },
  profileName: { fontSize: 16, fontWeight: '800', color: Colors.n900 },
  profileOvr: { alignItems: 'center', backgroundColor: Colors.primary, borderRadius: Radius.r999, paddingHorizontal: 12, paddingVertical: 6 },
  profileOvrNum: { fontSize: 18, fontWeight: '800', color: Colors.white, lineHeight: 20 },
  profileOvrLbl: { fontSize: 9, fontWeight: '700', color: Colors.white },
  profileStatsTitle: { fontSize: 12, fontWeight: '800', color: Colors.n500, textTransform: 'uppercase', marginBottom: 12 },
  profileNoStats: { fontSize: 13, color: Colors.n400, textAlign: 'center', paddingVertical: 8 },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  statLabel: { fontSize: 12, color: Colors.n500, width: 78 },
  statBarBg: { flex: 1, height: 6, backgroundColor: Colors.n200, borderRadius: Radius.r999, overflow: 'hidden' },
  statBarFill: { height: '100%', borderRadius: Radius.r999, backgroundColor: Colors.primary },
  statValue: { fontSize: 11, fontWeight: '800', color: Colors.primary, width: 44, textAlign: 'right' },
  profileCloseBtn: { backgroundColor: Colors.n100, borderRadius: Radius.r12, paddingVertical: 13, alignItems: 'center', marginTop: 16 },
  profileCloseBtnText: { fontSize: 14, fontWeight: '800', color: Colors.n700 },
});
