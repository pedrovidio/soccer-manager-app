import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { athleteApi, notificationApi } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import { Notification, NotificationType } from '../types';
import { colors, typography, spacing, radius } from '../theme';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Agora';
  if (mins < 60) return `${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return days === 1 ? 'Ontem' : `${days}d`;
}

type IconConfig = { name: keyof typeof Ionicons.glyphMap; color: string; bg: string };

const iconMap: Record<NotificationType, IconConfig> = {
  MATCH_INVITE:          { name: 'football',      color: colors.primary, bg: '#DBEAFE' },
  MATCH_INVITE_ACCEPTED: { name: 'checkmark-circle', color: colors.green, bg: '#DCFCE7' },
  MATCH_INVITE_DECLINED: { name: 'close-circle',  color: colors.red,    bg: '#FEE2E2' },
  GROUP_INVITE:          { name: 'people',         color: colors.green,  bg: '#DCFCE7' },
  INVITE_ACCEPTED:       { name: 'checkmark-circle', color: colors.green, bg: '#DCFCE7' },
  INVITE_DECLINED:       { name: 'close-circle',  color: colors.red,    bg: '#FEE2E2' },
  SYSTEM:                { name: 'alarm',          color: colors.orange, bg: '#FEF3C7' },
};

export default function NotificationsScreen() {
  const { athlete } = useAuth();
  const [tab, setTab] = useState<'all' | 'unread'>('all');

  const { data, loading, refetch } = useFetch<Notification[]>(
    () => athleteApi.notifications(athlete!.id),
    [athlete?.id],
  );

  const notifications = data ?? [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const displayed = tab === 'unread' ? notifications.filter((n) => !n.isRead) : notifications;

  const markAsRead = useCallback(async (id: string) => {
    await notificationApi.markAsRead(id);
    refetch();
  }, [refetch]);

  const markAllAsRead = useCallback(async () => {
    const unread = notifications.filter((n) => !n.isRead);
    await Promise.all(unread.map((n) => notificationApi.markAsRead(n.id)));
    refetch();
  }, [notifications, refetch]);

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tab, tab === 'all' && styles.tabActive]} onPress={() => setTab('all')}>
          <Text style={[styles.tabText, tab === 'all' && styles.tabTextActive]}>Todas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'unread' && styles.tabActive]} onPress={() => setTab('unread')}>
          <View style={styles.tabWithBadge}>
            <Text style={[styles.tabText, tab === 'unread' && styles.tabTextActive]}>Não lidas</Text>
            {unreadCount > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{unreadCount}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.md, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} tintColor={colors.primary} />}
      >
        {loading && <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />}

        {!loading && displayed.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={40} color={colors.gray600} />
            <Text style={[typography.body, { color: colors.gray600, marginTop: spacing.sm }]}>
              {tab === 'unread' ? 'Nenhuma notificação não lida.' : 'Nenhuma notificação.'}
            </Text>
          </View>
        )}

        {displayed.map((n) => {
          const icon = iconMap[n.type] ?? iconMap.SYSTEM;
          return (
            <TouchableOpacity
              key={n.id}
              style={[styles.notifRow, !n.isRead && styles.notifUnread]}
              activeOpacity={0.7}
              onPress={() => !n.isRead && markAsRead(n.id)}
            >
              <View style={[styles.notifIcon, { backgroundColor: icon.bg }]}>
                <Ionicons name={icon.name} size={20} color={icon.color} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.notifHeader}>
                  <Text style={[typography.body, { color: colors.black, fontWeight: n.isRead ? '400' : '700', flex: 1 }]}>
                    {n.title}
                  </Text>
                  <Text style={[typography.caption, { color: colors.gray600, marginLeft: spacing.xs }]}>
                    {timeAgo(n.createdAt)}
                  </Text>
                </View>
                <Text style={[typography.caption, { color: colors.gray600 }]}>{n.body}</Text>
              </View>
              {!n.isRead && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          );
        })}

        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markAllBtn} onPress={markAllAsRead}>
            <Text style={[typography.caption, { color: colors.primary, fontWeight: '600' }]}>
              Marcar todas como lidas
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  tabBar: {
    flexDirection: 'row', backgroundColor: colors.white,
    paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.gray200,
  },
  tab: {
    paddingVertical: spacing.sm, paddingHorizontal: spacing.md,
    marginRight: spacing.sm, borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: colors.primary },
  tabText: { fontSize: 14, color: colors.gray600 },
  tabTextActive: { color: colors.primary, fontWeight: '600' },
  tabWithBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  countBadge: {
    backgroundColor: colors.red, borderRadius: radius.full,
    minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
  },
  countText: { color: colors.white, fontSize: 10, fontWeight: '700' },
  notifRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm,
    backgroundColor: colors.white, borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.sm,
  },
  notifUnread: { backgroundColor: '#EFF6FF' },
  notifIcon: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  notifHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginTop: 6 },
  markAllBtn: { alignItems: 'center', paddingVertical: spacing.md },
  emptyState: { alignItems: 'center', paddingTop: spacing.xl },
});
