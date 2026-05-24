import { StyleSheet } from 'react-native';
import { Colors, Radius, Spacing } from '../../../../ui/tokens/theme';

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.n50 },
  keyboard: { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.n200,
    gap: 12,
  },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 15, fontWeight: '700', color: Colors.n900 },
  headerSub: { fontSize: 11, color: Colors.n500 },
  readOnlyBadge: {
    backgroundColor: Colors.warningLight,
    borderRadius: Radius.r8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  readOnlyText: { fontSize: 11, fontWeight: '600', color: Colors.warningDark },
  scroll: { padding: Spacing.lg, paddingBottom: 40 },
  divider: { height: 1, backgroundColor: Colors.n200, marginVertical: 16 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: Colors.n700, marginBottom: 4 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.n100,
  },
  infoLabel: { fontSize: 13, color: Colors.n700 },
  infoValue: { fontSize: 13, fontWeight: '700', color: Colors.n900 },
  btn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.r12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 24,
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
});
