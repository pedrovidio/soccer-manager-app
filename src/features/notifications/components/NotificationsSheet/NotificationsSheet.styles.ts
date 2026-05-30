import { StyleSheet } from 'react-native';
import { Arena, Colors, Radius, Spacing } from '@ui/tokens/theme';

export const styles = StyleSheet.create({
  // ── Screen ──────────────────────────────────────────────────────────
  screen: {
    flex: 1,
    backgroundColor: Arena.bg,
  },

  // ── Header ──────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: Arena.line,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Arena.cardSoft,
    borderWidth: 1,
    borderColor: Arena.line,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: Arena.text,
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
    color: Arena.textSubtle,
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
    backgroundColor: Arena.card,
    borderRadius: Radius.r12,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: Arena.line,
  },
  cardUnread: {
    backgroundColor: Arena.neonSoft,
    borderWidth: 1,
    borderColor: Arena.neonBorder,
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
    fontWeight: '800',
    color: Arena.text,
    marginRight: 8,
  },
  cardTime: {
    fontSize: 11,
    color: Arena.textSubtle,
    flexShrink: 0,
  },
  cardBody: {
    fontSize: 12,
    color: Arena.textMuted,
    lineHeight: 17,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Arena.neon,
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
    backgroundColor: 'rgba(34, 197, 94, 0.16)',
    borderColor: 'rgba(34, 197, 94, 0.32)',
  },
  actionBtnDecline: {
    backgroundColor: 'rgba(239, 68, 68, 0.16)',
    borderColor: 'rgba(239, 68, 68, 0.32)',
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
    color: Arena.textMuted,
    marginTop: 8,
  },
  emptyBody: {
    fontSize: 13,
    color: Arena.textSubtle,
  },

  // ── Mark all read ────────────────────────────────────────────────────
  markAllBtn: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Arena.neon,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: Radius.r999,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  markAllText: {
    fontSize: 13,
    fontWeight: '900',
    color: Arena.bgDeep,
  },
});
