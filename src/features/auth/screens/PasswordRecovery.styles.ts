import { StyleSheet } from 'react-native';
import { Arena, Colors, Radius, Spacing } from '@ui/tokens/theme';

export const passwordRecoveryStyles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Arena.bg,
  },
  keyboard: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: 40,
  },
  panel: {
    backgroundColor: Arena.card,
    borderColor: Arena.line,
    borderRadius: Radius.r16,
    borderWidth: 1,
    padding: Spacing.xl,
  },
  brand: {
    marginBottom: Spacing.xl,
  },
  title: {
    color: Arena.text,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: Spacing.sm,
  },
  description: {
    color: Arena.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  form: {
    gap: Spacing.sm,
  },
  codeInput: {
    fontSize: 18,
    letterSpacing: 8,
    textAlign: 'center',
  },
  feedback: {
    borderRadius: Radius.r8,
    color: Arena.textMuted,
    fontSize: 12,
    lineHeight: 18,
    padding: Spacing.md,
  },
  error: {
    backgroundColor: Colors.errorLight,
    color: Colors.errorDark,
  },
  hint: {
    backgroundColor: Colors.primaryLight,
    color: Colors.secondary,
  },
  action: {
    marginTop: Spacing.md,
  },
});
