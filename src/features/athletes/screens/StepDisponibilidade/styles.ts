import { StyleSheet } from 'react-native';
import { Arena, Colors, Radius } from '@ui/tokens/theme';

export const styles = StyleSheet.create({
  stepTitle: { fontSize: 22, fontWeight: '800', color: Arena.text, marginBottom: 4 },
  stepSubtitle: { fontSize: 13, color: Arena.textMuted, marginBottom: 20 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: Arena.text, marginBottom: 10 },
  daysRow: { gap: 8, marginBottom: 4 },
  dayChip: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: Arena.line, backgroundColor: Arena.card, marginRight: 8 },
  dayChipActive: { borderColor: Arena.neon, backgroundColor: Arena.neonSoft },
  dayChipText: { fontSize: 11, fontWeight: '600', color: Arena.textMuted },
  dayChipTextActive: { color: Arena.neon, fontWeight: '800' },
  slotsWrap: { marginTop: 16 },
  slotCard: { backgroundColor: Arena.graphiteElevated, borderRadius: Radius.r12, borderWidth: 1.5, borderColor: Arena.line, padding: 16, marginBottom: 12 },
  slotCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  slotDayLabel: { fontSize: 15, fontWeight: '800', color: Arena.text },
  slotRemove: { fontSize: 13, fontWeight: '700', color: Colors.error },
  slotTimeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  timeBlock: { flex: 1 },
  timeLabel: { fontSize: 12, fontWeight: '800', color: Arena.text, marginBottom: 6 },
  timeDiv: { paddingHorizontal: 12, justifyContent: 'flex-end', paddingBottom: 10 },
  timeDivText: { fontSize: 13, color: Arena.textSubtle },
  emptySlots: { alignItems: 'center', paddingVertical: 16 },
  emptySlotsText: { fontSize: 13, color: Arena.textSubtle },
});
