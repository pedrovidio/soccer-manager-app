import { StyleSheet } from 'react-native';
import { Colors, Radius, Spacing } from '../../../common/theme';

export const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.n100,
    borderRadius: Radius.r12,
    padding: 4,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.r8,
    paddingVertical: 9,
    minHeight: 34,
  },
  itemActive: { backgroundColor: Colors.white },
  text: { fontSize: 11, fontWeight: '700', color: Colors.n500 },
  textActive: { color: Colors.primary },
});
