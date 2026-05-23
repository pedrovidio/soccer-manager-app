import React, { memo } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { Colors } from '../../../../ui/tokens/theme';
import { s } from '../MatchHomeScreen.styles';

interface CounterBadgeProps {
  value: number;
  label: string;
  color: string;
  active: boolean;
  onPress?: () => void;
}

export const CounterBadge = memo(function CounterBadge({ value, label, color, active, onPress }: CounterBadgeProps) {
  return (
    <TouchableOpacity
      style={[s.counterItem, active && { backgroundColor: Colors.primaryLight }]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.75}
    >
      <Text style={[s.counterValue, { color }]}>{value}</Text>
      <Text style={s.counterLabel}>{label}</Text>
    </TouchableOpacity>
  );
});
