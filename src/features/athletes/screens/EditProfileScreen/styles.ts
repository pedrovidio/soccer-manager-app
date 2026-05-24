import { StyleSheet } from 'react-native';
import { Colors, Radius, Spacing } from '../../../../ui/tokens/theme';

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.n50 },
  keyboard: { flex: 1 },
  scroll: { padding: Spacing.lg, paddingBottom: 40 },
  btn: { backgroundColor: Colors.primary, borderRadius: Radius.r12, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
});
