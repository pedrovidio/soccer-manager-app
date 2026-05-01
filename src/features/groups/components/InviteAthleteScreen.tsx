import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, SectionList,
  StyleSheet, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '../../common/theme';
import { groupApi } from '../services/groupApi';
import { useAuthStore } from '../../auth/useAuthStore';
import { AthleteSearchResult, GroupInviteItem } from '../groupTypes';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function positionLabel(pos: string) {
  const map: Record<string, string> = {
    Goalkeeper: 'Goleiro', Defender: 'Zagueiro',
    Midfielder: 'Meia',    Forward:  'Atacante', Undefined: '—',
  };
  return map[pos] ?? pos;
}

type ResendState = 'idle' | 'sending' | 'sent' | 'error';
type InviteState = 'idle' | 'sending' | 'sent' | 'error';

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function InviteAthleteScreen() {
  const { groupId, groupName } = useLocalSearchParams<{ groupId: string; groupName: string }>();
  const router  = useRouter();
  const adminId = useAuthStore((s) => s.athleteId) ?? '';

  // Pending invites (loaded on mount, updated after each invite action)
  const [pendingInvites,  setPendingInvites]  = useState<GroupInviteItem[]>([]);
  const [loadingInvites,  setLoadingInvites]  = useState(true);

  // Search
  const [query,           setQuery]           = useState('');
  const [results,         setResults]         = useState<AthleteSearchResult[]>([]);
  const [searching,       setSearching]       = useState(false);
  const [noResults,       setNoResults]       = useState(false);

  // Per-athlete action states
  const [inviteMap,       setInviteMap]       = useState<Record<string, InviteState>>({});
  const [resendMap,       setResendMap]       = useState<Record<string, ResendState>>({});

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load existing invites on mount ──
  async function loadInvites() {
    if (!groupId) return;
    try {
      const data = await groupApi.listGroupInvites(groupId);
      // Only show PENDING — ACCEPTED ones disappear from the list
      setPendingInvites(data.filter((i) => i.status === 'PENDING'));
    } catch {
      setPendingInvites([]);
    } finally {
      setLoadingInvites(false);
    }
  }

  useEffect(() => { loadInvites(); }, [groupId]);

  // ── Debounced search ──
  const handleSearch = useCallback((text: string) => {
    setQuery(text);
    setNoResults(false);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (text.trim().length < 2) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        // Server already excludes: requester, members, PENDING/ACCEPTED invitees
        const data = await groupApi.searchAthletes(text.trim(), groupId, adminId);
        setResults(data);
        setNoResults(data.length === 0);
      } catch {
        setResults([]);
        setNoResults(true);
      } finally {
        setSearching(false);
      }
    }, 400);
  }, [groupId, adminId]);

  // ── Send new invite ──
  async function handleInvite(athlete: AthleteSearchResult) {
    setInviteMap((prev) => ({ ...prev, [athlete.id]: 'sending' }));
    try {
      await groupApi.inviteAthlete(groupId!, adminId, athlete.id);
      setInviteMap((prev) => ({ ...prev, [athlete.id]: 'sent' }));
      // Remove from search results and add to pending list
      setResults((prev) => prev.filter((a) => a.id !== athlete.id));
      setPendingInvites((prev) => [{
        inviteId:  '',
        athleteId: athlete.id,
        name:      athlete.name,
        position:  athlete.position,
        overall:   athlete.overall,
        email:     athlete.email,
        status:    'PENDING',
        createdAt: new Date().toISOString(),
      }, ...prev]);
    } catch {
      setInviteMap((prev) => ({ ...prev, [athlete.id]: 'error' }));
    }
  }

  // ── Resend invite ──
  async function handleResend(invite: GroupInviteItem) {
    setResendMap((prev) => ({ ...prev, [invite.athleteId]: 'sending' }));
    try {
      await groupApi.inviteAthlete(groupId!, adminId, invite.athleteId);
      setResendMap((prev) => ({ ...prev, [invite.athleteId]: 'sent' }));
      // Reset after 2s
      setTimeout(() => setResendMap((prev) => ({ ...prev, [invite.athleteId]: 'idle' })), 2000);
    } catch {
      setResendMap((prev) => ({ ...prev, [invite.athleteId]: 'error' }));
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  const showPending = pendingInvites.length > 0;
  const showResults = query.length >= 2;

  return (
    <SafeAreaView style={s.safe}>

      {/* ── HEADER ── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={20} color={Colors.n900} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Convidar atleta</Text>
          {groupName ? <Text style={s.headerSub} numberOfLines={1}>{groupName}</Text> : null}
        </View>
      </View>

      {/* ── SEARCH BAR ── */}
      <View style={s.searchBar}>
        <Ionicons name="search-outline" size={18} color={Colors.n400} />
        <TextInput
          style={s.searchInput}
          placeholder="Buscar por nome..."
          placeholderTextColor={Colors.n400}
          value={query}
          onChangeText={handleSearch}
          autoFocus
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {searching && <ActivityIndicator size="small" color={Colors.primary} />}
      </View>

      <SectionList
        keyboardShouldPersistTaps="handled"
        stickySectionHeadersEnabled={false}
        sections={[
          // No query yet — no hint section needed
          ...(showResults ? [{
            key: 'results',
            title: results.length > 0 ? 'Resultados da busca' : '',
            data: results.length > 0 ? results as any[] : [{ __empty: true }],
            type: 'results' as const,
          }] : []),
          // Section 2: pending invites
          ...(showPending ? [{
            key: 'pending',
            title: `Convidados (${pendingInvites.length})`,
            data: pendingInvites as any[],
            type: 'pending' as const,
          }] : []),
        ]}
        keyExtractor={(item, index) =>
          (item as GroupInviteItem).inviteId || (item as AthleteSearchResult).id || String(index)
        }
        ListEmptyComponent={null}
        renderSectionHeader={({ section }) =>
          section.title ? (
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>{section.title}</Text>
            </View>
          ) : null
        }
        renderItem={({ item, section }) => {
          const sec = section as any;

          if (sec.type === 'results') {
            if (item.__empty) {
              if (searching) return null;
              return (
                <View style={s.emptyWrap}>
                  <Ionicons name="person-outline" size={40} color={Colors.n300} />
                  <Text style={s.emptyTitle}>Nenhum atleta encontrado</Text>
                  <Text style={s.emptyText}>
                    Tente um nome diferente ou verifique se o atleta está cadastrado.
                  </Text>
                </View>
              );
            }
            return (
              <SearchResultRow
                athlete={item as AthleteSearchResult}
                inviteState={inviteMap[item.id] ?? 'idle'}
                onInvite={handleInvite}
              />
            );
          }

          // pending
          return (
            <PendingRow
              invite={item as GroupInviteItem}
              resendState={resendMap[item.athleteId] ?? 'idle'}
              onResend={handleResend}
            />
          );
        }}
        ListFooterComponent={null}
      />
    </SafeAreaView>
  );
}

// ─── Pending invite row ───────────────────────────────────────────────────────

function PendingRow({
  invite, resendState, onResend,
}: {
  invite: GroupInviteItem;
  resendState: ResendState;
  onResend: (i: GroupInviteItem) => void;
}) {
  return (
    <View style={s.row}>
      <View style={[s.avatar, s.avatarPending]}>
        <Text style={[s.avatarText, { color: Colors.warning }]}>
          {invite.name.slice(0, 2).toUpperCase()}
        </Text>
      </View>
      <View style={s.info}>
        <Text style={s.name} numberOfLines={1}>{invite.name}</Text>
        <View style={s.meta}>
          <View style={s.posTag}>
            <Text style={s.posTagText}>{positionLabel(invite.position)}</Text>
          </View>
          <Text style={s.overall}>OVR {invite.overall}</Text>
          <View style={s.pendingTag}>
            <Text style={s.pendingTagText}>Pendente</Text>
          </View>
        </View>
      </View>
      {resendState === 'sending' ? (
        <View style={s.resendBtn}>
          <ActivityIndicator size="small" color={Colors.n500} />
        </View>
      ) : resendState === 'sent' ? (
        <View style={[s.resendBtn, s.resendBtnSent]}>
          <Ionicons name="checkmark" size={13} color={Colors.success} />
          <Text style={[s.resendBtnText, { color: Colors.success }]}>Reenviado</Text>
        </View>
      ) : (
        <TouchableOpacity style={s.resendBtn} onPress={() => onResend(invite)}>
          <Ionicons name="send-outline" size={13} color={Colors.n700} />
          <Text style={s.resendBtnText}>Reenviar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Search result row ────────────────────────────────────────────────────────

function SearchResultRow({
  athlete, inviteState, onInvite,
}: {
  athlete: AthleteSearchResult;
  inviteState: InviteState;
  onInvite: (a: AthleteSearchResult) => void;
}) {
  return (
    <View style={s.row}>
      <View style={s.avatar}>
        <Text style={s.avatarText}>{athlete.name.slice(0, 2).toUpperCase()}</Text>
      </View>
      <View style={s.info}>
        <Text style={s.name} numberOfLines={1}>{athlete.name}</Text>
        <View style={s.meta}>
          <View style={s.posTag}>
            <Text style={s.posTagText}>{positionLabel(athlete.position)}</Text>
          </View>
          <Text style={s.overall}>OVR {athlete.overall}</Text>
          <Text style={s.email} numberOfLines={1}>{athlete.email}</Text>
        </View>
      </View>
      {inviteState === 'sending' ? (
        <View style={s.inviteBtn}>
          <ActivityIndicator size="small" color={Colors.white} />
        </View>
      ) : inviteState === 'sent' ? (
        <View style={[s.inviteBtn, s.inviteBtnSent]}>
          <Ionicons name="checkmark" size={14} color={Colors.success} />
          <Text style={[s.inviteBtnText, { color: Colors.success }]}>Enviado</Text>
        </View>
      ) : inviteState === 'error' ? (
        <TouchableOpacity style={[s.inviteBtn, s.inviteBtnError]} onPress={() => onInvite(athlete)}>
          <Ionicons name="refresh-outline" size={14} color={Colors.error} />
          <Text style={[s.inviteBtnText, { color: Colors.error }]}>Tentar novamente</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={s.inviteBtn} onPress={() => onInvite(athlete)}>
          <Ionicons name="person-add-outline" size={14} color={Colors.white} />
          <Text style={s.inviteBtnText}>Convidar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: Colors.n50 },
  header:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.n200, gap: 12 },
  backBtn:         { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.n100, alignItems: 'center', justifyContent: 'center' },
  headerTitle:     { fontSize: 16, fontWeight: '700', color: Colors.n900 },
  headerSub:       { fontSize: 11, color: Colors.n500 },
  searchBar:       { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.n200, paddingHorizontal: Spacing.lg, paddingVertical: 10, gap: 10 },
  searchInput:     { flex: 1, fontSize: 16, color: Colors.n900, paddingVertical: 2 },
  sectionHeader:   { paddingHorizontal: Spacing.lg, paddingTop: 16, paddingBottom: 6 },
  sectionTitle:    { fontSize: 12, fontWeight: '700', color: Colors.n500, textTransform: 'uppercase', letterSpacing: 0.5 },
  emptyContainer:  { flex: 1 },
  emptyWrap:       { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40, gap: 8 },
  emptyTitle:      { fontSize: 16, fontWeight: '700', color: Colors.n700 },
  emptyText:       { fontSize: 13, color: Colors.n500, textAlign: 'center', lineHeight: 20 },
  row:             { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, paddingHorizontal: Spacing.lg, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.n100, gap: 12 },
  avatar:          { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarPending:   { backgroundColor: Colors.warningLight },
  avatarText:      { fontSize: 14, fontWeight: '800', color: Colors.primary },
  info:            { flex: 1, gap: 3 },
  name:            { fontSize: 14, fontWeight: '600', color: Colors.n900 },
  meta:            { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  posTag:          { backgroundColor: Colors.n100, borderRadius: Radius.r4, paddingHorizontal: 6, paddingVertical: 2 },
  posTagText:      { fontSize: 10, fontWeight: '700', color: Colors.n700 },
  overall:         { fontSize: 11, color: Colors.n500 },
  email:           { fontSize: 11, color: Colors.n400, flexShrink: 1 },
  pendingTag:      { backgroundColor: Colors.warningLight, borderRadius: Radius.r4, paddingHorizontal: 6, paddingVertical: 2 },
  pendingTagText:  { fontSize: 10, fontWeight: '700', color: Colors.warningDark },
  inviteBtn:       { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.primary, borderRadius: Radius.r8, paddingHorizontal: 10, paddingVertical: 7, flexShrink: 0 },
  inviteBtnSent:   { backgroundColor: Colors.successLight },
  inviteBtnError:  { backgroundColor: Colors.errorLight },
  inviteBtnText:   { fontSize: 12, fontWeight: '700', color: Colors.white },
  resendBtn:       { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.n100, borderRadius: Radius.r8, paddingHorizontal: 10, paddingVertical: 7, flexShrink: 0 },
  resendBtnSent:   { backgroundColor: Colors.successLight },
  resendBtnText:   { fontSize: 12, fontWeight: '600', color: Colors.n700 },
});
