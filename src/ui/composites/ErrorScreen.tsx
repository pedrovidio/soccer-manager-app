import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Arena, Colors, Radius, Spacing } from '@ui/tokens/theme';

type Props = {
  message?: string;
  onRetry: () => void;
};

export function ErrorScreen({
  message = 'Nao foi possivel abrir esta tela. Tente novamente.',
  onRetry,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <Ionicons name="alert-circle-outline" size={34} color={Colors.error} />
      </View>
      <Text style={styles.title}>Algo deu errado</Text>
      <Text style={styles.message}>{message}</Text>
      <TouchableOpacity style={styles.button} onPress={onRetry} activeOpacity={0.8}>
        <Text style={styles.buttonText}>Tentar novamente</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Arena.bg,
    paddingHorizontal: Spacing.xxl,
    gap: Spacing.md,
  },
  icon: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.r999,
    backgroundColor: 'rgba(239, 68, 68, 0.14)',
    marginBottom: Spacing.xs,
  },
  title: {
    color: Arena.text,
    fontSize: 20,
    fontWeight: '800',
  },
  message: {
    color: Arena.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  button: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.r12,
    backgroundColor: Arena.neon,
  },
  buttonText: {
    color: Arena.bgDeep,
    fontSize: 14,
    fontWeight: '700',
  },
});
