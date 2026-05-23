import { StyleSheet } from 'react-native';
import { Colors, Radius } from '../../../../ui/tokens/theme';

export const styles = StyleSheet.create({
  stepTitle: { fontSize: 22, fontWeight: '800', color: Colors.n900, marginBottom: 4 },
  stepSubtitle: { fontSize: 13, color: Colors.n500, marginBottom: 20 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: Colors.n700, marginBottom: 10 },
  sectionLabelSpaced: { marginTop: 16 },
  divider: { height: 1, backgroundColor: Colors.n200, marginVertical: 24 },
  levelList: { gap: 8 },
  overallCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.r12, borderWidth: 2, padding: 16, marginBottom: 24 },
  overallLabel: { fontSize: 13, fontWeight: '600', color: Colors.n700 },
  overallValue: { fontSize: 36, fontWeight: '800' },
});
