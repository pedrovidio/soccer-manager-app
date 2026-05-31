import { StyleSheet } from 'react-native';
import { Arena, Radius, Spacing } from '@ui/tokens/theme';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Arena.card,
    borderRadius: Radius.r12,
    borderWidth: 1,
    borderColor: Arena.line,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 9,
    gap: 10,
    marginBottom: 6,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Arena.neonSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 11, fontWeight: '800', color: Arena.neon },
  info: { flex: 1, minWidth: 0 },
  name: { fontSize: 12, fontWeight: '700', color: Arena.text },
  meta: { fontSize: 11, color: Arena.textMuted, marginTop: 2 },
  stars: { alignItems: 'center', gap: 1 },
  starButton: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
});
