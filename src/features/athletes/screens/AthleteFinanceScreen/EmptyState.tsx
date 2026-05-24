import React, { memo } from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../../ui/tokens/theme';
import { styles } from './styles';

function EmptyStateComponent({ text }: { text: string }) {
  return (
    <View style={styles.emptyCard}>
      <Ionicons name="wallet-outline" size={30} color={Colors.n300} />
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

export const EmptyState = memo(EmptyStateComponent);
