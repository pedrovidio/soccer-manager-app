import { StyleSheet } from 'react-native';
import { Arena, Colors, Radius } from '@ui/tokens/theme';

export const styles = StyleSheet.create({
  wrap: { marginBottom: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  label: { fontSize: 13, fontWeight: '800', color: Arena.text },
  value: { fontSize: 16, fontWeight: '900' },
  trackWrap: { paddingVertical: 10 },
  track: {
    height: 8,
    backgroundColor: Arena.line,
    borderRadius: Radius.r999,
  },
  fill: {
    position: 'absolute',
    left: 0,
    height: 8,
    borderRadius: Radius.r999,
  },
  thumb: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Arena.graphiteElevated,
    borderWidth: 3,
    left: 0,
    top: -9,
    elevation: 5,
  },
});
