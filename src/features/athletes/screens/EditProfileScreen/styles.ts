import { StyleSheet } from 'react-native';
import { Arena, Colors, Radius, Spacing } from '@ui/tokens/theme';

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Arena.bg },
  keyboard: { flex: 1 },
  scroll: { padding: Spacing.lg, paddingBottom: 40 },
  btn: { backgroundColor: Arena.neon, borderRadius: Radius.r16, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: Arena.bgDeep, fontSize: 15, fontWeight: '900' },
});
