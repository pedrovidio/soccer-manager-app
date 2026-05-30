import { StyleSheet } from 'react-native';
import { Arena, Colors, Radius } from '@ui/tokens/theme';

export const styles = StyleSheet.create({
  stepTitle: { fontSize: 22, fontWeight: '800', color: Arena.text, marginBottom: 4 },
  stepSubtitle: { fontSize: 13, color: Arena.textMuted, marginBottom: 20 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: Arena.text, marginBottom: 10 },
  sectionLabelSpaced: { marginTop: 16 },
  divider: { height: 1, backgroundColor: Arena.line, marginVertical: 24 },
  levelList: { gap: 8 },
  overallCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Arena.graphiteElevated, borderRadius: Radius.r12, borderWidth: 2, padding: 16, marginBottom: 24 },
  overallLabel: { fontSize: 13, fontWeight: '800', color: Arena.text },
  overallValue: { fontSize: 36, fontWeight: '800' },
});
