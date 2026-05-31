import { StyleSheet } from 'react-native';
import { Arena } from '@ui/tokens/theme';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: Arena.graphite,
    borderTopWidth: 1,
    borderTopColor: Arena.neonBorder,
    paddingTop: 8,
  },
  list: { flexGrow: 0 },
  listContent: { flexGrow: 1 },
  btn: { height: 48, alignItems: 'center', justifyContent: 'center', gap: 3 },
  activeHalo: {
    position: 'absolute',
    top: 4,
    left: 0,
    width: 54,
    height: 32,
    borderRadius: 18,
    backgroundColor: Arena.neonSoft,
  },
  label: { fontSize: 10, fontWeight: '700', color: Arena.textSubtle },
  labelActive: { color: Arena.neon, fontWeight: '900' },
});
