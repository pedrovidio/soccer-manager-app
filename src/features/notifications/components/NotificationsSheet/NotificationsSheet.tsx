import React, { useRef } from 'react';
import {
  Modal, View, Text, TouchableOpacity, FlatList,
  Animated, PanResponder, StatusBar, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Notification } from '../../types';
import { Colors } from '../../../common/theme';
import { styles } from './NotificationsSheet.styles';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const INVITE_TYPES = ['MATCH_INVITE', 'GROUP_INVITE'];

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1)  return 'agora';
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function notifIcon(type: string): { name: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap; color: string; bg: string } {
  switch (type) {
    case 'MATCH_INVITE':         return { name: 'football',          color: Colors.primary,     bg: Colors.primaryLight };
    case 'GROUP_INVITE':         return { name: 'people',            color: Colors.primary,     bg: Colors.primaryLight };
    case 'MATCH_INVITE_ACCEPTED':return { name: 'checkmark-circle',  color: Colors.successDark, bg: Colors.successLight };
    case 'MATCH_INVITE_DECLINED':return { name: 'close-circle',      color: Colors.errorDark,   bg: Colors.errorLight };
    case 'INVITE_ACCEPTED':      return { name: 'checkmark-circle',  color: Colors.successDark, bg: Colors.successLight };
    case 'INVITE_DECLINED':      return { name: 'close-circle',      color: Colors.errorDark,   bg: Colors.errorLight };
    default:                     return { name: 'notifications',     color: Colors.n500,        bg: Colors.n100 };
  }
}

// ─── NotifCard ────────────────────────────────────────────────────────────────

interface NotifCardProps {
  item: Notification;
  onDelete: (id: string) => void;
  onMarkRead: (id: string) => void;
  onRespondInvite: (notificationId: string, inviteId: string, accept: boolean) => void;
  respondInvitePending: boolean;
}

function NotifCard({ item, onDelete, onMarkRead, onRespondInvite, respondInvitePending }: NotifCardProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const isInvite = INVITE_TYPES.includes(item.type) && !!item.referenceId && !item.read;
  const icon = notifIcon(item.type);

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 10 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderMove: (_, g) => { translateX.setValue(g.dx); },
      onPanResponderRelease: (_, g) => {
        if (Math.abs(g.dx) > 120) {
          Animated.timing(translateX, {
            toValue: g.dx > 0 ? 500 : -500,
            duration: 200,
            useNativeDriver: true,
          }).start(() => onDelete(item.id));
        } else {
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  return (
    <Animated.View style={[styles.card, { transform: [{ translateX }] }, !item.read && styles.cardUnread]} {...pan.panHandlers}>
      {/* Icon */}
      <View style={[styles.iconWrap, { backgroundColor: icon.bg }]}>
        <Ionicons name={icon.name} size={20} color={icon.color} />
      </View>

      {/* Content */}
      <TouchableOpacity
        style={styles.cardContent}
        onPress={() => !item.read && onMarkRead(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.cardTime}>{relativeTime(item.createdAt)}</Text>
        </View>
        <Text style={styles.cardBody} numberOfLines={2}>{item.body}</Text>

        {isInvite && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnAccept]}
              onPress={() => onRespondInvite(item.id, item.referenceId!, true)}
              disabled={respondInvitePending}
            >
              <Ionicons name="checkmark" size={14} color={Colors.successDark} />
              <Text style={[styles.actionBtnText, { color: Colors.successDark }]}>Aceitar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnDecline]}
              onPress={() => onRespondInvite(item.id, item.referenceId!, false)}
              disabled={respondInvitePending}
            >
              <Ionicons name="close" size={14} color={Colors.errorDark} />
              <Text style={[styles.actionBtnText, { color: Colors.errorDark }]}>Recusar</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>

      {/* Unread dot */}
      {!item.read && <View style={styles.unreadDot} />}
    </Animated.View>
  );
}

// ─── NotificationsSheet ───────────────────────────────────────────────────────

interface NotificationsSheetProps {
  visible: boolean;
  notifications: Notification[];
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDelete: (id: string) => void;
  onDeleteAll: () => void;
  onRespondInvite: (notificationId: string, inviteId: string, accept: boolean) => void;
  respondInvitePending: boolean;
}

export function NotificationsSheet({
  visible, notifications, onClose, onMarkRead, onMarkAllRead,
  onDelete, onDeleteAll, onRespondInvite, respondInvitePending,
}: NotificationsSheetProps) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <StatusBar backgroundColor={Colors.n900} barStyle="light-content" />
      <SafeAreaView style={styles.screen}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={onClose}>
            <Ionicons name="arrow-back" size={22} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mensagens</Text>
          {notifications.length > 0 ? (
            <TouchableOpacity style={styles.clearBtn} onPress={onDeleteAll}>
              <Text style={styles.clearBtnText}>Apagar todas</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 90 }} />
          )}
        </View>

        {/* ── Hint ── */}
        {notifications.length > 0 && (
          <Text style={styles.hint}>← Deslize para remover</Text>
        )}

        {/* ── List ── */}
        {notifications.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="notifications-off-outline" size={52} color={Colors.n600} />
            <Text style={styles.emptyTitle}>Nenhuma mensagem</Text>
            <Text style={styles.emptyBody}>Você está em dia com tudo</Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            renderItem={({ item }) => (
              <NotifCard
                item={item}
                onDelete={onDelete}
                onMarkRead={onMarkRead}
                onRespondInvite={onRespondInvite}
                respondInvitePending={respondInvitePending}
              />
            )}
          />
        )}

        {/* ── Mark all read ── */}
        {notifications.some((n) => !n.read) && (
          <TouchableOpacity style={styles.markAllBtn} onPress={onMarkAllRead}>
            <Ionicons name="checkmark-done" size={16} color={Colors.primary} />
            <Text style={styles.markAllText}>Marcar todas como lidas</Text>
          </TouchableOpacity>
        )}

      </SafeAreaView>
    </Modal>
  );
}
