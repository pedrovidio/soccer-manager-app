import { StyleSheet } from 'react-native';
import { Arena } from '@ui/tokens/theme';

export const styles = StyleSheet.create({
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Arena.cardSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Arena.line,
  },
  icon: {
    marginLeft: -1,
  },
});
