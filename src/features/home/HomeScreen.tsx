import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  SafeAreaView, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../auth/useAuthStore';
import { useHomeDashboard } from './hooks/useHomeDashboard';
import { useNotificationActions } from '../notifications/hooks/useNotifications';
import { useFavoriteGroup } from '../groups/hooks/useFavoriteGroup';
import { groupApi } from '../groups/services/groupApi';
import { useQuery } from '@tanstack/react-query';
import { OverallBadge } from '../common/components/OverallBadge';
import { Badge } from '../common/components/Badge';
import { BottomNav, NavTab } from '../common/components/BottomNav';
import { MatchCard } from './components/MatchCard';
import { NotificationsSheet } from '../notifications/components/NotificationsSheet';
import { Colors } from '../common/theme';
import { styles } from './HomeScreen.styles';

export default function HomeScreen() {
  const [activeTab] = useState<NavTab>('home');
  const [matchTab, setMatchTab] = useState<'upcoming' | 'past'>('upcoming');
  const [showNotifications, setShowNotifications] = useState(false);

  const router = useRouter();
  const athleteId = useAuthStore((s) => s.athleteId) ?? '';
  const authName  = useAuthStore((s) => s.name);

  const { dashboard, notifications, confirmedMatches, isLoading, isError, refetch } =
    useHomeDashboard(athleteId);

  const { unreadCount, markAsRead, markAllAsRead, deleteOne, deleteAll, respondInvite, respondInvitePending } =
    useNotificationActions(athleteId, notifications);

  const { favoriteId } = useFavoriteGroup();
  const { data: favoriteGroup } = useQuery({
    queryKey: ['group', favoriteId],
    queryFn: () => groupApi.findById(favoriteId!),
    enabled: !!favoriteId,
  });

  // Prefer fresh dashboard data, fall back to auth store values while loading
  const name     = dashboard?.name     ?? authName     ?? '—';
  const overall  = dashboard?.overall  ?? 0;
  const position = dashboard?.position ?? '—';
  const status   = dashboard?.status   ?? 'Ativo';

  const allMatches  = confirmedMatches;
  const upcoming    = allMatches.filter((m) => m.status === 'SCHEDULED' || m.status === 'IN_PROGRESS');
  const past        = allMatches.filter((m) => m.status === 'FINISHED'  || m.status === 'CANCELLED');
  const matches     = matchTab === 'upcoming' ? upcoming : past;

  if (isLoading && !dashboard) {
    return (
      <SafeAreaView style={[styles.safe, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Bem-vindo de volta 👋</Text>
            <Text style={styles.athleteName}>{name}</Text>
            <View style={styles.statsRow}>
              <OverallBadge value={overall} />
              <Text style={styles.positionText}>{position}</Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.msgBtn} onPress={() => setShowNotifications(true)}>
              <Ionicons name="chatbubble-outline" size={24} color={Colors.n700} />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <Badge label={status} variant="ok" />
          </View>
        </View>
      </View>

      {/* ── CONTENT ── */}
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} colors={[Colors.primary]} />}
      >
        {/* ── FAVORITE GROUP SHORTCUT ── */}
        {favoriteGroup && (
          <TouchableOpacity
            style={styles.favoriteCard}
            onPress={() => router.push({ pathname: '/group-home', params: { groupId: favoriteGroup.id } } as any)}
            activeOpacity={0.7}
          >
            <View style={styles.favoriteCardLeft}>
              <Ionicons name="star" size={14} color={Colors.warning} />
              <Text style={styles.favoriteCardLabel}>Grupo favorito</Text>
            </View>
            <View style={styles.favoriteCardRight}>
              <Text style={styles.favoriteCardName} numberOfLines={1}>{favoriteGroup.name}</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.n400} />
            </View>
          </TouchableOpacity>
        )}
        <View style={styles.section}>
          <View style={styles.tabs}>
            <Text
              style={[styles.tab, matchTab === 'upcoming' ? styles.tabActive : null]}
              onPress={() => setMatchTab('upcoming')}
            >
              Próximas
            </Text>
            <Text
              style={[styles.tab, matchTab === 'past' ? styles.tabActive : null]}
              onPress={() => setMatchTab('past')}
            >
              Histórico
            </Text>
          </View>

          <Text style={styles.sectionTitle}>
            {matchTab === 'upcoming' ? 'Próximas Partidas' : 'Últimas Partidas'}
          </Text>

          {isError && (
            <View style={styles.emptyCard}>
              <Ionicons name="alert-circle-outline" size={36} color={Colors.error} />
              <Text style={[styles.emptyText, { color: Colors.errorDark }]}>
                Erro ao carregar partidas
              </Text>
            </View>
          )}

          {!isError && matches.length === 0 && (
            <View style={styles.emptyCard}>
              <Ionicons name="football-outline" size={36} color={Colors.n300} />
              <Text style={styles.emptyText}>Nenhuma partida encontrada</Text>
            </View>
          )}

          {matches.map((match) => (
            <MatchCard key={match.id} match={match} confirmed />
          ))}
        </View>
      </ScrollView>

      {/* ── BOTTOM NAV ── */}
      <BottomNav active={activeTab} />

      {/* ── NOTIFICATIONS SHEET ── */}
      <NotificationsSheet
        visible={showNotifications}
        notifications={notifications}
        onClose={() => setShowNotifications(false)}
        onMarkRead={markAsRead}
        onMarkAllRead={markAllAsRead}
        onDelete={deleteOne}
        onDeleteAll={deleteAll}
        onRespondInvite={respondInvite}
        respondInvitePending={respondInvitePending}
      />
    </SafeAreaView>
  );
}
