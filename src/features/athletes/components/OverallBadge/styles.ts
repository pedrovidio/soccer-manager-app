import { StyleSheet } from 'react-native';
import { Colors, Radius } from '../../../../ui/tokens/theme';

export const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: Radius.r999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  num: { fontSize: 16, fontWeight: '800', color: Colors.white, lineHeight: 18 },
  lbl: { fontSize: 10, fontWeight: '600', color: Colors.white },
});
