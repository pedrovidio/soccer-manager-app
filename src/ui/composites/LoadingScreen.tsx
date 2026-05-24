import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing } from '@ui/tokens/theme';

type Props = {
  label?: string;
};

export function LoadingScreen({ label = 'Carregando...' }: Props) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.n50,
    gap: Spacing.md,
  },
  label: {
    color: Colors.n600,
    fontSize: 14,
    fontWeight: '600',
  },
});
