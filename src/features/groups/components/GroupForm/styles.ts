import { StyleSheet } from 'react-native';
import { Arena, Colors, Radius, Spacing } from '@ui/tokens/theme';

export const styles = StyleSheet.create({
  scroll: { padding: Spacing.lg, paddingBottom: 40 },
  sectionLabel: { fontSize: 13, fontWeight: '800', color: Arena.text, marginBottom: 4 },
  divider: { height: 1, backgroundColor: Arena.line, marginVertical: 16 },
  sectionDesc: { fontSize: 12, color: Arena.textMuted, marginBottom: 12 },
  field: { marginBottom: 12 },
  fieldLabel: { fontSize: 12, fontWeight: '800', color: Arena.text, marginBottom: 5 },
  input: {
    backgroundColor: Arena.graphiteElevated,
    borderWidth: 1,
    borderColor: Arena.neonBorder,
    borderRadius: Radius.r16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Arena.text,
    fontWeight: '700',
  },
  inputMultiline: { minHeight: 80, textAlignVertical: 'top' },
  inputDisabled: { backgroundColor: Arena.cardSoft, color: Arena.textSubtle },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  leftColumn: { flex: 1, marginRight: 8 },
  column: { flex: 1 },
});
