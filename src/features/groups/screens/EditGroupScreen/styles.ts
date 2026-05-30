import { StyleSheet } from 'react-native';
import { Arena, Colors, Radius, Spacing } from '@ui/tokens/theme';

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Arena.bg },
  keyboard: { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: 'rgba(6, 16, 15, 0.96)',
    borderBottomWidth: 1,
    borderBottomColor: Arena.line,
    gap: 12,
  },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 15, fontWeight: '700', color: Arena.text },
  headerSub: { fontSize: 11, color: Arena.textMuted },
  readOnlyBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.16)',
    borderRadius: Radius.r8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  readOnlyText: { fontSize: 11, fontWeight: '600', color: '#FBBF24' },
  scroll: { padding: Spacing.lg, paddingBottom: 40 },
  divider: { height: 1, backgroundColor: Arena.line, marginVertical: 16 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: Arena.textMuted, marginBottom: 4 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Arena.line,
  },
  infoLabel: { fontSize: 13, color: Arena.textMuted },
  infoValue: { fontSize: 13, fontWeight: '700', color: Arena.text },
  btn: {
    backgroundColor: Arena.neon,
    borderRadius: Radius.r12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 24,
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: Arena.bgDeep, fontSize: 15, fontWeight: '900' },
});
