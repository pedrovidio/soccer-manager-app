import React, { useMemo } from 'react';
import { Modal, StatusBar, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../../ui/tokens/theme';
import { EmptyNotifications } from './EmptyNotifications';
import { MarkAllReadButton } from './MarkAllReadButton';
import { NotificationsHeader } from './NotificationsHeader';
import { NotificationsList } from './NotificationsList';
import { styles } from './styles';
import { NotificationsSheetProps } from './types';

export function NotificationsSheet({
  visible,
  notifications,
  onClose,
  onMarkRead,
  onMarkAllRead,
  onDelete,
  onDeleteAll,
  onRespondInvite,
  respondInvitePending,
  onRespondSpotApplication,
  respondSpotApplicationPending,
  blockMatchAccept,
}: NotificationsSheetProps) {
  const hasNotifications = notifications.length > 0;
  const hasUnread = useMemo(() => notifications.some((notification) => !notification.read), [notifications]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <StatusBar backgroundColor={Colors.n900} barStyle="light-content" />
      <SafeAreaView style={styles.screen}>
        <NotificationsHeader
          hasNotifications={hasNotifications}
          onClose={onClose}
          onDeleteAll={onDeleteAll}
        />

        {hasNotifications && <Text style={styles.hint}>← Deslize para remover</Text>}

        {hasNotifications ? (
          <NotificationsList
            notifications={notifications}
            onDelete={onDelete}
            onMarkRead={onMarkRead}
            onRespondInvite={onRespondInvite}
            respondInvitePending={respondInvitePending}
            onRespondSpotApplication={onRespondSpotApplication}
            respondSpotApplicationPending={respondSpotApplicationPending}
            blockMatchAccept={blockMatchAccept}
          />
        ) : (
          <EmptyNotifications />
        )}

        {hasUnread && <MarkAllReadButton onPress={onMarkAllRead} />}
      </SafeAreaView>
    </Modal>
  );
}
