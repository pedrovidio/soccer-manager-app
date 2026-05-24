import React, { memo, useCallback } from 'react';
import { FlatList, View } from 'react-native';
import { Notification } from '@features/notifications/types';
import { NotificationCard } from './NotificationCard';
import { NotificationActionProps } from './types';
import { styles } from './styles';

type NotificationsListProps = Omit<NotificationActionProps, 'item'> & {
  notifications: Notification[];
};

function NotificationsListComponent({ notifications, ...actions }: NotificationsListProps) {
  const renderItem = useCallback(({ item }: { item: Notification }) => (
    <NotificationCard item={item} {...actions} />
  ), [actions]);

  const renderSeparator = useCallback(() => <View style={styles.separator} />, []);

  return (
    <FlatList
      data={notifications}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      ItemSeparatorComponent={renderSeparator}
      renderItem={renderItem}
    />
  );
}

export const NotificationsList = memo(NotificationsListComponent);
