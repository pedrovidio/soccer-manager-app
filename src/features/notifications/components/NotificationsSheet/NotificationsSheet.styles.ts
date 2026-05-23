import { StyleSheet } from 'react-native';
import { Colors, Radius, Spacing } from '../../../../ui/tokens/theme';

export const styles = StyleSheet.create({
  // ── Screen ──────────────────────────────────────────────────────────
  screen: {
    flex: 1,
    backgroundColor: Colors.n900,
  },

  // ── Header ──────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
    marginLeft: 12,
  },
  clearBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.r8,
    backgroundColor: 'rgba(239,68,68,0.15)',
  },
  clearBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FCA5A5',
  },
  headerSpacer: {
    width: 90,
  },

  // ── Hint ────────────────────────────────────────────────────────────
  hint: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
    paddingVertical: 8,
  },

  // ── List ────────────────────────────────────────────────────────────
  list: {
    padding: Spacing.md,
    paddingBottom: 80,
  },
  separator: {
    height: 6,
  },

  // ── Card ────────────────────────────────────────────────────────────
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: Radius.r12,
    padding: 12,
    gap: 12,
  },
  cardUnread: {
    backgroundColor: 'rgba(47,104,255,0.12)',
    borderWidth: 0.5,
    borderColor: 'rgba(47,104,255,0.3)',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  cardTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
    marginRight: 8,
  },
  cardTime: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    flexShrink: 0,
  },
  cardBody: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 17,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginTop: 4,
    flexShrink: 0,
  },

  // ── Invite actions ───────────────────────────────────────────────────
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.r999,
    borderWidth: 1,
  },
  actionBtnAccept: {
    backgroundColor: Colors.successLight,
    borderColor: Colors.success,
  },
  actionBtnDecline: {
    backgroundColor: Colors.errorLight,
    borderColor: Colors.error,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // ── Empty ────────────────────────────────────────────────────────────
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.6)',
    marginTop: 8,
  },
  emptyBody: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.3)',
  },

  // ── Mark all read ────────────────────────────────────────────────────
  markAllBtn: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: Radius.r999,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  markAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
});
