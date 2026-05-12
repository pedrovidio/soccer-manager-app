import React from 'react';
import {
  ActivityIndicator, RefreshControl, SafeAreaView, ScrollView,
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { BackButton } from '../../common/components/BackButton';
import { Colors, Radius, Spacing } from '../../common/theme';
import { useAuthStore } from '../../auth/useAuthStore';
import { groupApi } from '../services/groupApi';
import { GroupUpcomingMatch } from '../groupTypes';
import { GroupTopMenu } from './GroupTopMenu';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function GroupMatchesScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const router = useRouter();
  const athleteId = useAuthStore((s) => s.athleteId) ?? '';

  const { data, isLoading, isError, error, refetch } = useQuery({
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
    const isForbidden = (error as any)?.response?.status === 403;
    return (
      <SafeAreaView style={[s.safe, s.center]}>
        <Ionicons name="alert-circle-outline" size={40} color={Colors.error} />
        <Text style={s.errorText}>{isForbidden ? 'Voce nao tem acesso a este grupo' : 'Erro ao carregar jogos'}</Text>
        <TouchableOpacity style={s.primaryBtn} onPress={() => (isForbidden ? router.back() : refetch())}>
          <Text style={s.primaryBtnText}>{isForbidden ? 'Voltar' : 'Tentar novamente'}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const { group, isAdmin, upcomingMatches } = data;

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <BackButton />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={s.headerTitle}>Jogos</Text>
          <Text style={s.headerSub} numberOfLines={1}>{group.name}</Text>
        </View>
        {isAdmin && (
          <TouchableOpacity
            style={s.iconBtn}
            onPress={() => router.push({ pathname: '/create-match', params: { groupId } } as any)}
          >
            <Ionicons name="add" size={22} color={Colors.n700} />
          </TouchableOpacity>
        )}
      </View>

      <GroupTopMenu groupId={groupId!} active="matches" showFinance={isAdmin} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} colors={[Colors.primary]} />}
        contentContainerStyle={s.scroll}
      >
        {upcomingMatches.length === 0 ? (
          <View style={s.emptyCard}>
            <Ionicons name="football-outline" size={34} color={Colors.n300} />
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
        ) : upcomingMatches.map((match) => (
          <MatchRow
            key={match.id}
            match={match}
            onPress={() => router.push({ pathname: '/match-home', params: { matchId: match.id, groupId, isAdmin: isAdmin ? '1' : '0' } } as any)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function MatchRow({ match, onPress }: { match: GroupUpcomingMatch; onPress: () => void }) {
  const spotsLeft = match.totalVacancies - match.confirmedCount;
  return (
    <TouchableOpacity style={s.matchCard} onPress={onPress} activeOpacity={0.75}>
      <View style={s.matchDateBox}>
        <Text style={s.matchDay}>{formatDate(match.date).split(',')[0]?.toUpperCase()}</Text>
        <Text style={s.matchDayNum}>{new Date(match.date).getDate()}</Text>
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
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

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.n50 },
  center: { justifyContent: 'center', alignItems: 'center', gap: 8 },
  errorText: { fontSize: 14, color: Colors.n700 },
  primaryBtn: { marginTop: 8, paddingHorizontal: 18, paddingVertical: 10, backgroundColor: Colors.primary, borderRadius: Radius.r8 },
  primaryBtnText: { color: Colors.white, fontWeight: '700', fontSize: 13 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.n200, gap: 12 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: Colors.n900 },
  headerSub: { fontSize: 11, color: Colors.n500 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.n100, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: Spacing.lg, paddingBottom: 28 },
  emptyCard: { alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.r12, borderWidth: 1, borderColor: Colors.n200, paddingVertical: 28, gap: 8 },
  emptyText: { fontSize: 13, color: Colors.n500 },
  emptyAction: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: Colors.primary, borderRadius: Radius.r8 },
  emptyActionText: { color: Colors.white, fontWeight: '700', fontSize: 13 },
  matchCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.r12, borderWidth: 1, borderColor: Colors.n200, padding: Spacing.md, marginBottom: 8, gap: 12 },
  matchDateBox: { width: 44, alignItems: 'center', backgroundColor: Colors.primaryLight, borderRadius: Radius.r8, paddingVertical: 6 },
  matchDay: { fontSize: 9, fontWeight: '700', color: Colors.primary },
  matchDayNum: { fontSize: 18, fontWeight: '800', color: Colors.primary },
  matchLocation: { fontSize: 13, fontWeight: '700', color: Colors.n900 },
  matchTime: { fontSize: 11, color: Colors.n500, marginTop: 2 },
  matchSpots: { alignItems: 'center' },
  matchSpotsNum: { fontSize: 14, fontWeight: '800' },
  matchSpotsLabel: { fontSize: 10, color: Colors.n500 },
});
