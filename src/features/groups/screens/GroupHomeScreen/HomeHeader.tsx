import React, { memo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@ui/tokens/theme';
import { BackButton } from '@ui/composites/BackButton';
import { GroupHomeShortcut } from '@features/groups/components/GroupHomeShortcut';
import { styles } from './styles';

type Props = {
  groupName: string;
  membersCount: number;
  isAdmin: boolean;
  onEdit: () => void;
};

function HomeHeaderComponent({ groupName, membersCount, isAdmin, onEdit }: Props) {
  return (
    <View style={styles.header}>
      <BackButton />
      <View style={styles.headerBody}>
        <Text style={styles.headerTitle} numberOfLines={1}>{groupName}</Text>
        <Text style={styles.headerSub}>{membersCount} membros</Text>
      </View>
      <View style={styles.headerActions}>
        <GroupHomeShortcut />
        {isAdmin && (
          <TouchableOpacity accessibilityLabel="Editar grupo" accessibilityRole="button" style={styles.iconBtn} onPress={onEdit}>
            <Ionicons name="settings-outline" size={20} color={Colors.n700} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export const HomeHeader = memo(HomeHeaderComponent);
