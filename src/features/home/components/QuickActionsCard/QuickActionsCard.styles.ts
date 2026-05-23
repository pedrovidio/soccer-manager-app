import { StyleSheet } from 'react-native';
import { Colors, Radius, Spacing } from '../../../../ui/tokens/theme';

export const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: Radius.r12,
    borderWidth: 1,
    borderColor: Colors.n200,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.n900,
  },
  viewAll: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.n100,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  itemBody: {
    flex: 1,
    gap: 3,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.n900,
  },
  itemText: {
    fontSize: 12,
    color: Colors.n500,
    lineHeight: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: 7,
    flexWrap: 'wrap',
  },
  actionBtn: {
    minHeight: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.r999,
    borderWidth: 1,
  },
  acceptBtn: {
    backgroundColor: Colors.successLight,
    borderColor: Colors.success,
  },
  declineBtn: {
    backgroundColor: Colors.errorLight,
    borderColor: Colors.error,
  },
  blockedBtn: {
    backgroundColor: Colors.n100,
    borderColor: Colors.n300,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '800',
  },
});
