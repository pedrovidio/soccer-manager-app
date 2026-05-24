import { StyleSheet } from 'react-native';
import { Colors, Radius, Spacing } from '@ui/tokens/theme';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.r8,
    borderWidth: 1,
    borderColor: Colors.n200,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 9,
    gap: 10,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 11, fontWeight: '800', color: Colors.primary },
  info: { flex: 1, minWidth: 0 },
  name: { fontSize: 12, fontWeight: '700', color: Colors.n900 },
  meta: { fontSize: 11, color: Colors.n500, marginTop: 2 },
  stars: { alignItems: 'center', gap: 1 },
  starButton: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
});
