import { StyleSheet } from 'react-native';
import { Arena, Colors, Radius, Spacing } from '@ui/tokens/theme';

export const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    backgroundColor: Arena.card,
    borderRadius: Radius.r16,
    borderWidth: 1,
    borderColor: Arena.neonBorder,
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
    color: Arena.text,
  },
  viewAll: {
    fontSize: 12,
    fontWeight: '700',
    color: Arena.neon,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Arena.line,
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
    color: Arena.text,
  },
  itemText: {
    fontSize: 12,
    color: Arena.textMuted,
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
