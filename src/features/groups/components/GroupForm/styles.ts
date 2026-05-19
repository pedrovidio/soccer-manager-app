import { StyleSheet } from 'react-native';
import { Colors, Radius, Spacing } from '../../../common/theme';

export const styles = StyleSheet.create({
  scroll: { padding: Spacing.lg, paddingBottom: 40 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: Colors.n700, marginBottom: 4 },
  divider: { height: 1, backgroundColor: Colors.n200, marginVertical: 16 },
  sectionDesc: { fontSize: 12, color: Colors.n500, marginBottom: 12 },
  field: { marginBottom: 12 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: Colors.n700, marginBottom: 5 },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.n300,
    borderRadius: Radius.r8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.n900,
  },
  inputMultiline: { minHeight: 80, textAlignVertical: 'top' },
  inputDisabled: { backgroundColor: Colors.n100, color: Colors.n500 },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  leftColumn: { flex: 1, marginRight: 8 },
  column: { flex: 1 },
});
