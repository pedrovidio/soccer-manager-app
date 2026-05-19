import React, { memo, useCallback, useMemo } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NotificationActionProps } from './types';
import {
  isActionableInvite,
  isActionableSpotApplication,
  notificationIcon,
  relativeTime,
} from './notificationUtils';
import { InviteActions, SpotApplicationActions } from './NotificationActions';
import { styles } from './styles';
import { useSwipeToDelete } from './useSwipeToDelete';

function NotificationCardComponent({
  item,
  onDelete,
  onMarkRead,
  onRespondInvite,
  respondInvitePending,
  onRespondSpotApplication,
  respondSpotApplicationPending,
  blockMatchAccept,
}: NotificationActionProps) {
  const handleDelete = useCallback(() => onDelete(item.id), [item.id, onDelete]);
  const { translateX, panHandlers } = useSwipeToDelete(handleDelete);
  const icon = useMemo(() => notificationIcon(item.type), [item.type]);
  const isInvite = isActionableInvite(item);
  const isSpotApplication = isActionableSpotApplication(item);
  const isMatchAcceptBlocked = blockMatchAccept && item.type === 'MATCH_INVITE';

  const handlePress = useCallback(() => {
    if (!item.read) onMarkRead(item.id);
  }, [item.id, item.read, onMarkRead]);

  const handleInviteAccept = useCallback(() => {
    if (item.referenceId) onRespondInvite(item.id, item.referenceId, true);
  }, [item.id, item.referenceId, onRespondInvite]);

  const handleInviteDecline = useCallback(() => {
    if (item.referenceId) onRespondInvite(item.id, item.referenceId, false);
  }, [item.id, item.referenceId, onRespondInvite]);

  const handleSpotApprove = useCallback(() => {
    if (item.referenceId) onRespondSpotApplication?.(item.referenceId, true);
  }, [item.referenceId, onRespondSpotApplication]);

  const handleSpotDecline = useCallback(() => {
    if (item.referenceId) onRespondSpotApplication?.(item.referenceId, false);
  }, [item.referenceId, onRespondSpotApplication]);

  return (
    <Animated.View
      style={[styles.card, { transform: [{ translateX }] }, !item.read && styles.cardUnread]}
      {...panHandlers}
    >
      <View style={[styles.iconWrap, { backgroundColor: icon.bg }]}>
        <Ionicons name={icon.name} size={20} color={icon.color} />
      </View>

      <TouchableOpacity style={styles.cardContent} onPress={handlePress} activeOpacity={0.7}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.cardTime}>{relativeTime(item.createdAt)}</Text>
        </View>
        <Text style={styles.cardBody} numberOfLines={2}>{item.body}</Text>

        {isInvite && (
          <InviteActions
            isAcceptBlocked={isMatchAcceptBlocked}
            isPending={respondInvitePending}
            onAccept={handleInviteAccept}
            onDecline={handleInviteDecline}
          />
        )}

        {isSpotApplication && onRespondSpotApplication && (
          <SpotApplicationActions
            isPending={respondSpotApplicationPending}
            onApprove={handleSpotApprove}
            onDecline={handleSpotDecline}
          />
        )}
      </TouchableOpacity>

      {!item.read && <View style={styles.unreadDot} />}
    </Animated.View>
  );
}

export const NotificationCard = memo(NotificationCardComponent);
