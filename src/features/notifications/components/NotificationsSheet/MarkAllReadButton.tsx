import React, { memo } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Arena } from '@ui/tokens/theme';
import { styles } from './styles';

type MarkAllReadButtonProps = {
  onPress: () => void;
};

function MarkAllReadButtonComponent({ onPress }: MarkAllReadButtonProps) {
  return (
    <TouchableOpacity style={styles.markAllBtn} onPress={onPress}>
      <Ionicons name="checkmark-done" size={16} color={Arena.bgDeep} />
      <Text style={styles.markAllText}>Marcar todas como lidas</Text>
    </TouchableOpacity>
  );
}

export const MarkAllReadButton = memo(MarkAllReadButtonComponent);
