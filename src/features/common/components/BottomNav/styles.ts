import { StyleSheet } from 'react-native';
import { Colors } from '../../theme';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderTopWidth: 0.5,
    borderTopColor: Colors.n200,
    paddingTop: 6,
  },
  list: { flexGrow: 0 },
  listContent: { flexGrow: 1 },
  btn: { height: 44, alignItems: 'center', justifyContent: 'center', gap: 2 },
  label: { fontSize: 10, fontWeight: '500', color: Colors.n400 },
  labelActive: { color: Colors.primary, fontWeight: '600' },
});
