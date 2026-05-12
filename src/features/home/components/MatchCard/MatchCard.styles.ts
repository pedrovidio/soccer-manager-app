import { StyleSheet } from 'react-native';
import { Colors, Radius, Spacing } from '../../../common/theme';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.r12,
    borderWidth: 0.5,
    borderColor: Colors.n200,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.n200,
  },
  dateRow:  { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateText: { fontSize: 12, fontWeight: '600', color: Colors.n700 },
  dot:      { width: 3, height: 3, borderRadius: 2, backgroundColor: Colors.n300 },

  body:     { paddingHorizontal: 14, paddingVertical: 12, gap: 8 },

  typeTag:    { alignSelf: 'flex-start', fontSize: 11, fontWeight: '600', paddingHorizontal: 10, paddingVertical: 3, borderRadius: Radius.r4 },
  tagCampo:   { backgroundColor: Colors.successLight, color: Colors.successDark },
  tagSociety: { backgroundColor: '#DBEAFE', color: '#1D4ED8' },
  tagFutsal:  { backgroundColor: '#F3E8FF', color: '#6B21A8' },

  slotsRow:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  slotsText: { fontSize: 13, fontWeight: '700', color: Colors.primary },

  progBg:   { height: 6, backgroundColor: Colors.n200, borderRadius: Radius.r999, overflow: 'hidden' },
  progFill: { height: 6, backgroundColor: Colors.primary, borderRadius: Radius.r999 },

  confPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.successLight, borderRadius: Radius.r999, paddingHorizontal: 10, paddingVertical: 3 },
  confText: { fontSize: 11, fontWeight: '600', color: Colors.successDark },

  drawShortcut:     { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primaryLight, borderRadius: Radius.r8, paddingHorizontal: 10, paddingVertical: 9, marginTop: 2 },
  drawShortcutText: { fontSize: 12, fontWeight: '800', color: Colors.primary },
  waitingBox:       { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.warningLight, borderRadius: Radius.r8, paddingHorizontal: 10, paddingVertical: 9, marginTop: 2 },
  waitingText:      { fontSize: 12, fontWeight: '800', color: Colors.warningDark },
  teamsBox:         { borderTopWidth: 1, borderTopColor: Colors.n200, paddingTop: 10, marginTop: 2, gap: 6 },
  teamsTitle:       { fontSize: 12, fontWeight: '900', color: Colors.n900 },
  teamLine:         { borderRadius: Radius.r8, backgroundColor: Colors.n50, borderWidth: 1, borderColor: Colors.n200, padding: 8 },
  myTeamLine:       { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  teamName:         { fontSize: 11, fontWeight: '900', color: Colors.n700, marginBottom: 2 },
  myTeamName:       { color: Colors.primary },
  teamPlayers:      { fontSize: 11, fontWeight: '600', color: Colors.n600, lineHeight: 16 },
});
