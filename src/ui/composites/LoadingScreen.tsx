import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Arena, Spacing } from '@ui/tokens/theme';

type Props = {
  label?: string;
};

export function LoadingScreen({ label = 'Carregando...' }: Props) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Arena.neon} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Arena.bg,
    gap: Spacing.md,
  },
  label: {
    color: Arena.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
});
