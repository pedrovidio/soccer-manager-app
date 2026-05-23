import React, { memo, useMemo } from 'react';
import { View, Text } from 'react-native';
import { BADGE_VARIANT, BadgeVariant } from './options';
import { styles } from './styles';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

function BadgeComponent({ label, variant = 'neutral' }: BadgeProps) {
  const { bg, text } = BADGE_VARIANT[variant];
  const containerStyle = useMemo(() => ({ backgroundColor: bg }), [bg]);
  const textStyle = useMemo(() => ({ color: text }), [text]);

  return (
    <View style={[styles.base, containerStyle]}>
      <Text style={[styles.text, textStyle]}>{label}</Text>
    </View>
  );
}

export const Badge = memo(BadgeComponent);
