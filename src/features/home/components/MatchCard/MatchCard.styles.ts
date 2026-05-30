import { StyleSheet } from 'react-native';
import { Arena, Colors, Radius, Spacing } from '@ui/tokens/theme';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: Arena.card,
    borderRadius: Radius.r16,
    borderWidth: 1,
    borderColor: Arena.line,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  liveCard: {
    borderColor: Arena.neon,
    borderWidth: 1.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: Arena.line,
  },
  dateRow:  { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateText: { fontSize: 12, fontWeight: '800', color: Arena.textMuted },
  dot:      { width: 3, height: 3, borderRadius: 2, backgroundColor: Arena.neon },

  body:     { paddingHorizontal: 14, paddingVertical: 12, gap: 8 },

  typeTag:    { alignSelf: 'flex-start', fontSize: 11, fontWeight: '600', paddingHorizontal: 10, paddingVertical: 3, borderRadius: Radius.r4 },
  tagCampo:   { backgroundColor: Colors.successLight, color: Colors.successDark },
  tagSociety: { backgroundColor: '#DBEAFE', color: '#1D4ED8' },
  tagFutsal:  { backgroundColor: '#F3E8FF', color: '#6B21A8' },

  slotsRow:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  slotsText: { fontSize: 13, fontWeight: '900', color: Arena.neon },

  progBg:   { height: 6, backgroundColor: Arena.line, borderRadius: Radius.r999, overflow: 'hidden' },
  progFill: { height: 6, backgroundColor: Arena.neon, borderRadius: Radius.r999 },

  confPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.successLight, borderRadius: Radius.r999, paddingHorizontal: 10, paddingVertical: 3 },
  confText: { fontSize: 11, fontWeight: '600', color: Colors.successDark },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.errorLight, borderRadius: Radius.r999, paddingHorizontal: 10, paddingVertical: 4 },
  liveDot: { width: 7, height: 7, borderRadius: Radius.r999, backgroundColor: Colors.error },
  liveText: { fontSize: 11, fontWeight: '800', color: Colors.errorDark },

  drawShortcut:     { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Arena.neonSoft, borderRadius: Radius.r12, paddingHorizontal: 10, paddingVertical: 9, marginTop: 2 },
  drawShortcutText: { fontSize: 12, fontWeight: '900', color: Arena.neon },
  liveShortcut:     { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.errorLight, borderRadius: Radius.r8, paddingHorizontal: 10, paddingVertical: 9, marginTop: 2 },
  liveShortcutText: { fontSize: 12, fontWeight: '800', color: Colors.errorDark },
  waitingBox:       { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.warningLight, borderRadius: Radius.r8, paddingHorizontal: 10, paddingVertical: 9, marginTop: 2 },
  waitingText:      { fontSize: 12, fontWeight: '800', color: Colors.warningDark },
  teamsBox:         { borderTopWidth: 1, borderTopColor: Arena.line, paddingTop: 10, marginTop: 2, gap: 6 },
  teamsTitle:       { fontSize: 12, fontWeight: '900', color: Arena.text },
  teamLine:         { borderRadius: Radius.r12, backgroundColor: Arena.cardSoft, borderWidth: 1, borderColor: Arena.line, padding: 8 },
  myTeamLine:       { backgroundColor: Arena.neonSoft, borderColor: Arena.neon },
  teamName:         { fontSize: 11, fontWeight: '900', color: Arena.textMuted, marginBottom: 2 },
  myTeamName:       { color: Arena.neon },
  teamPlayers:      { fontSize: 11, fontWeight: '700', color: Arena.textMuted, lineHeight: 16 },
});
