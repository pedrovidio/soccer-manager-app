import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius } from '../../theme';

type BadgeVariant = 'ok' | 'warn' | 'err' | 'inf' | 'neutral' | 'gold' | 'silver';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const variantMap: Record<BadgeVariant, { bg: string; text: string }> = {
  ok:      { bg: Colors.successLight,  text: Colors.successDark },
  warn:    { bg: Colors.warningLight,  text: Colors.warningDark },
  err:     { bg: Colors.errorLight,    text: Colors.errorDark },
  inf:     { bg: Colors.primaryLight,  text: Colors.primaryDark },
  neutral: { bg: Colors.n100,          text: Colors.n700 },
  gold:    { bg: '#FEF3C7',            text: '#92400E' },
  silver:  { bg: Colors.n100,          text: Colors.n700 },
};

export function Badge({ label, variant = 'neutral' }: BadgeProps) {
  const { bg, text } = variantMap[variant];
  return (
    <View style={[styles.base, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: Radius.r999, paddingHorizontal: 9, paddingVertical: 3, alignSelf: 'flex-start' },
  text: { fontSize: 11, fontWeight: '600' },
});
