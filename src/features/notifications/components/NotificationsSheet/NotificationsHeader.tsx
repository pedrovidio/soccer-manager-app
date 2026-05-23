import React, { memo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../../ui/tokens/theme';
import { styles } from './styles';

type NotificationsHeaderProps = {
  hasNotifications: boolean;
  onClose: () => void;
  onDeleteAll: () => void;
};

function NotificationsHeaderComponent({ hasNotifications, onClose, onDeleteAll }: NotificationsHeaderProps) {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backBtn} onPress={onClose}>
        <Ionicons name="arrow-back" size={22} color={Colors.white} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Mensagens</Text>
      {hasNotifications ? (
        <TouchableOpacity style={styles.clearBtn} onPress={onDeleteAll}>
          <Text style={styles.clearBtnText}>Apagar todas</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.headerSpacer} />
      )}
    </View>
  );
}

export const NotificationsHeader = memo(NotificationsHeaderComponent);
