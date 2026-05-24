import React, { memo } from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@ui/tokens/theme';
import { styles } from './styles';

function EmptyNotificationsComponent() {
  return (
    <View style={styles.emptyWrap}>
      <Ionicons name="notifications-off-outline" size={52} color={Colors.n600} />
      <Text style={styles.emptyTitle}>Nenhuma mensagem</Text>
      <Text style={styles.emptyBody}>Você está em dia com tudo</Text>
    </View>
  );
}

export const EmptyNotifications = memo(EmptyNotificationsComponent);
