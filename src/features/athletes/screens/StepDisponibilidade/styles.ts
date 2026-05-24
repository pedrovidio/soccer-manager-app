import { StyleSheet } from 'react-native';
import { Colors, Radius } from '../../../../ui/tokens/theme';

export const styles = StyleSheet.create({
  stepTitle: { fontSize: 22, fontWeight: '800', color: Colors.n900, marginBottom: 4 },
  stepSubtitle: { fontSize: 13, color: Colors.n500, marginBottom: 20 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: Colors.n700, marginBottom: 10 },
  daysRow: { gap: 8, marginBottom: 4 },
  dayChip: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: Colors.n300, backgroundColor: Colors.white, marginRight: 8 },
  dayChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  dayChipText: { fontSize: 11, fontWeight: '600', color: Colors.n700 },
  dayChipTextActive: { color: Colors.primary },
  slotsWrap: { marginTop: 16 },
  slotCard: { backgroundColor: Colors.white, borderRadius: Radius.r12, borderWidth: 1, borderColor: Colors.n200, padding: 16, marginBottom: 12 },
  slotCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  slotDayLabel: { fontSize: 15, fontWeight: '700', color: Colors.n900 },
  slotRemove: { fontSize: 13, fontWeight: '600', color: Colors.error },
  slotTimeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  timeBlock: { flex: 1 },
  timeLabel: { fontSize: 12, fontWeight: '600', color: Colors.n500, marginBottom: 6 },
  timeDiv: { paddingHorizontal: 12, justifyContent: 'flex-end', paddingBottom: 10 },
  timeDivText: { fontSize: 13, color: Colors.n500 },
  emptySlots: { alignItems: 'center', paddingVertical: 16 },
  emptySlotsText: { fontSize: 13, color: Colors.n400 },
});
