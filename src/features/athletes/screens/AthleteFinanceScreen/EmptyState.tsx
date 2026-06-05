import React, { memo } from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Arena } from '@ui/tokens/theme';
import { styles } from './styles';

function EmptyStateComponent({ text }: { text: string }) {
  return (
    <View style={styles.emptyCard}>
      <Ionicons name="wallet-outline" size={30} color={Arena.textSubtle} />
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

export const EmptyState = memo(EmptyStateComponent);
