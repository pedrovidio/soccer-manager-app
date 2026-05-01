import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, FlatList,
  StyleSheet, SafeAreaView, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../src/features/auth/useAuthStore';
import { groupApi } from '../src/features/groups/services/groupApi';
import { BottomNav, NavTab } from '../src/features/common/components/BottomNav';
import { Colors, Radius, Spacing } from '../src/features/common/theme';
import { GroupResponse } from '../src/features/groups/groupTypes';

export default function GroupsScreen() {
  const [activeTab, setActiveTab] = useState<NavTab>('groups');
  const router = useRouter();
  const { bottom } = useSafeAreaInsets();
  const athleteId = useAuthStore((s) => s.athleteId) ?? '';

  const { data: groups = [], isLoading, isError, refetch } = useQuery<GroupResponse[]>({
    queryKey: ['groups', athleteId],
    queryFn: () => groupApi.listByAthlete(athleteId),
    enabled: !!athleteId,
  });

  function handleTabPress(tab: NavTab) {
    if (tab === 'groups') return;
    if (tab === 'home') { router.replace('/'); return; }
    router.push(`/${tab}` as any);
  }

  return (
    <SafeAreaView style={s.safe}>
      {/* ── HEADER ── */}
      <View style={s.header}>
        <Text style={s.title}>Meus Grupos</Text>
        <TouchableOpacity style={s.addBtn} onPress={() => router.push('/create-group')}>
          <Ionicons name="add" size={22} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* ── CONTENT ── */}
      {isLoading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : isError ? (
        <View style={s.center}>
          <Ionicons name="alert-circle-outline" size={40} color={Colors.error} />
          <Text style={s.emptyText}>Erro ao carregar grupos</Text>
          <TouchableOpacity style={s.retryBtn} onPress={() => refetch()}>
            <Text style={s.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.id}
          contentContainerStyle={groups.length === 0 ? s.emptyContainer : s.list}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} colors={[Colors.primary]} />
          }
          ListEmptyComponent={
            <View style={s.center}>
              <Ionicons name="people-outline" size={48} color={Colors.n300} />
              <Text style={s.emptyTitle}>Nenhum grupo ainda</Text>
              <Text style={s.emptyText}>Crie um grupo ou aguarde um convite</Text>
              <TouchableOpacity style={s.createBtn} onPress={() => router.push('/create-group')}>
                <Ionicons name="add-circle-outline" size={18} color={Colors.white} />
                <Text style={s.createBtnText}>Criar grupo</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <GroupCard
              group={item}
              onPress={() => router.push({ pathname: '/group-home', params: { groupId: item.id } } as any)}
            />
          )}
        />
      )}

      {/* ── BOTTOM NAV ── */}
      <BottomNav active={activeTab} onPress={handleTabPress} />
    </SafeAreaView>
  );
}

function GroupCard({ group, onPress }: { group: GroupResponse; onPress: () => void }) {
  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.7}>
      <View style={s.cardAvatar}>
        <Text style={s.cardAvatarText}>
          {group.name.slice(0, 2).toUpperCase()}
        </Text>
      </View>
      <View style={s.cardBody}>
        <Text style={s.cardName} numberOfLines={1}>{group.name}</Text>
        {group.description ? (
          <Text style={s.cardDesc} numberOfLines={1}>{group.description}</Text>
        ) : null}
        <View style={s.cardMeta}>
          <Ionicons name="people-outline" size={12} color={Colors.n500} />
          <Text style={s.cardMetaText}>{group.memberIds.length} membros</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.n300} />
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: Colors.n50 },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.n200 },
  title:          { fontSize: 20, fontWeight: '800', color: Colors.n900 },
  addBtn:         { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  center:         { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyContainer: { flex: 1 },
  list:           { padding: Spacing.lg, gap: 10 },
  emptyTitle:     { fontSize: 16, fontWeight: '700', color: Colors.n700, marginTop: 8 },
  emptyText:      { fontSize: 13, color: Colors.n500 },
  retryBtn:       { marginTop: 8, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: Colors.primary, borderRadius: Radius.r8 },
  retryText:      { color: Colors.white, fontWeight: '600', fontSize: 13 },
  createBtn:      { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, paddingHorizontal: 20, paddingVertical: 12, backgroundColor: Colors.primary, borderRadius: Radius.r12 },
  createBtnText:  { color: Colors.white, fontWeight: '700', fontSize: 14 },
  card:           { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.r12, padding: Spacing.md, borderWidth: 1, borderColor: Colors.n200, gap: 12 },
  cardAvatar:     { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  cardAvatarText: { fontSize: 14, fontWeight: '800', color: Colors.primary },
  cardBody:       { flex: 1, gap: 2 },
  cardName:       { fontSize: 14, fontWeight: '700', color: Colors.n900 },
  cardDesc:       { fontSize: 12, color: Colors.n500 },
  cardMeta:       { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  cardMetaText:   { fontSize: 11, color: Colors.n500 },
});
