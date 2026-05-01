import React, { useRef } from 'react';
import {
  Modal, View, Text, TouchableOpacity, FlatList,
  Animated, PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Notification } from '../../types';
import { Avatar } from '../../../common/components/Avatar';
import { Colors } from '../../../common/theme';
import { styles } from './NotificationsSheet.styles';

interface SwipeRowProps {
  item: Notification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}

function SwipeRow({ item, onMarkRead, onDelete }: SwipeRowProps) {
  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8,
      onPanResponderMove: (_, g) => {
        if (g.dx < 0) translateX.setValue(g.dx);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dx < -60) {
          Animated.timing(translateX, { toValue: -72, useNativeDriver: true, duration: 150 }).start();
        } else {
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  return (
    <View style={{ overflow: 'hidden' }}>
      <View style={[styles.swipeDelete, { position: 'absolute', right: 0, top: 0, bottom: 0, width: 72 }]}>
        <TouchableOpacity onPress={() => onDelete(item.id)} style={{ alignItems: 'center' }}>
          <Ionicons name="trash-outline" size={18} color={Colors.white} />
          <Text style={styles.swipeDeleteText}>Apagar</Text>
        </TouchableOpacity>
      </View>
      <Animated.View style={[styles.notifRow, { transform: [{ translateX }] }]} {...panResponder.panHandlers}>
        <View style={[styles.dot, item.read ? styles.dotRead : null]} />
        <Avatar initials={item.avatarInitials} size="sm" color="blue" />
        <TouchableOpacity style={styles.notifContent} onPress={() => !item.read && onMarkRead(item.id)}>
          <Text style={[styles.notifTitle, item.read ? styles.notifTitleRead : null]}>
            {item.title}
          </Text>
          <Text style={styles.notifBody}>{item.body}</Text>
          <Text style={styles.notifTime}>{item.createdAt}</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

interface NotificationsSheetProps {
  visible: boolean;
  notifications: Notification[];
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDelete: (id: string) => void;
  onDeleteAll: () => void;
}

export function NotificationsSheet({
  visible, notifications, onClose, onMarkRead, onMarkAllRead, onDelete, onDeleteAll,
}: NotificationsSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Mensagens</Text>
            <View style={styles.headerActions}>
              {notifications.some((n) => !n.read) && (
                <TouchableOpacity onPress={onMarkAllRead}>
                  <Text style={styles.actionText}>Marcar todas como lidas</Text>
                </TouchableOpacity>
              )}
              {notifications.length > 0 && (
                <TouchableOpacity onPress={onDeleteAll}>
                  <Text style={styles.deleteAllText}>Apagar todas</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {notifications.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="mail-open-outline" size={40} color={Colors.n300} />
              <Text style={styles.emptyText}>Nenhuma mensagem</Text>
            </View>
          ) : (
            <FlatList
              data={notifications}
              keyExtractor={(item) => item.id}
              style={styles.list}
              renderItem={({ item }) => (
                <SwipeRow item={item} onMarkRead={onMarkRead} onDelete={onDelete} />
              )}
            />
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
