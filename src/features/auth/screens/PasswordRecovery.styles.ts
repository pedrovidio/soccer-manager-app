import { StyleSheet } from 'react-native';
import { Colors, Radius, Spacing } from '@ui/tokens/theme';

export const passwordRecoveryStyles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.n50,
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
    backgroundColor: Colors.white,
    borderColor: Colors.n200,
    borderRadius: Radius.r16,
    borderWidth: 1,
    padding: Spacing.xl,
  },
  title: {
    color: Colors.n900,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: Spacing.sm,
  },
  description: {
    color: Colors.n500,
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
    color: Colors.n700,
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
