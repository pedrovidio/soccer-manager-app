import { StyleSheet } from 'react-native';
import { Arena, Colors, Radius, Spacing } from '@ui/tokens/theme';

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Arena.bg },
  keyboard: { flex: 1 },
  scroll: { padding: Spacing.lg, paddingBottom: 40 },
  btn: { backgroundColor: Arena.neon, borderRadius: Radius.r16, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: Arena.bgDeep, fontSize: 15, fontWeight: '900' },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Arena.cardSoft,
    borderRadius: Radius.r12,
    padding: 4,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: Radius.r8,
  },
  activeTab: {
    backgroundColor: Arena.neon,
  },
  tabText: {
    color: Arena.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  activeTabText: {
    color: Arena.bgDeep,
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Arena.line,
  },
  headerTitle: {
    color: Arena.text,
    fontSize: 18,
    fontWeight: '700',
  },
});

