import { StyleSheet } from 'react-native';
import { Arena, Radius, Spacing } from '@ui/tokens/theme';

export const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: Arena.bg,
    padding: Spacing.lg,
  },
  section: {
    marginBottom: 24,
  },
  sectionLast: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Arena.text,
    marginBottom: 16,
  },
  optionGrid: { gap: 8, marginBottom: 16 },
  optionGridRow: { gap: 8 },
  optionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Arena.text,
    marginBottom: 8,
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.r999,
    borderWidth: 1,
    backgroundColor: Arena.card,
    borderColor: Arena.line,
  },
  optionChipSelected: {
    backgroundColor: Arena.neon,
    borderColor: Arena.neon,
  },
  optionText: {
    fontSize: 14,
    color: Arena.textMuted,
  },
  optionTextSelected: {
    color: Arena.buttonLabelPrimary,
    fontWeight: '700',
  },
  statGridRow: { justifyContent: 'space-between' },
  statCell: {
    width: '48%',
    marginBottom: 16,
  },
  statLabel: {
    fontSize: 14,
    color: Arena.textMuted,
    fontWeight: '500',
    marginBottom: 4,
  },
  statInput: {
    backgroundColor: Arena.graphiteElevated,
    borderWidth: 1,
    borderColor: Arena.line,
    borderRadius: Radius.r12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: Arena.text,
    fontWeight: '600',
  },
  statError: {
    color: Arena.error,
    fontSize: 12,
    marginTop: 4,
  },
  overallCard: {
    marginBottom: 24,
    alignItems: 'center',
    backgroundColor: Arena.card,
    padding: 24,
    borderRadius: Radius.r16,
    borderWidth: 1,
    borderColor: Arena.line,
  },
  overallLabel: {
    color: Arena.textMuted,
    fontWeight: '500',
    marginBottom: 4,
  },
  overallValue: {
    fontSize: 48,
    fontWeight: '900',
    color: Arena.neon,
  },
  overallHint: {
    fontSize: 12,
    color: Arena.textSubtle,
    marginTop: 8,
    textAlign: 'center',
  },
  submitBtn: {
    backgroundColor: Arena.neon,
    paddingVertical: 16,
    borderRadius: Radius.r12,
    alignItems: 'center',
    marginBottom: 40,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: Arena.buttonLabelPrimary,
    fontWeight: '700',
    fontSize: 18,
  },
});
