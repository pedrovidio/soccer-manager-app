import { StyleSheet } from 'react-native';
import { Radius } from '@ui/tokens/theme';

export const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.r999,
    paddingHorizontal: 9,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  text: { fontSize: 11, fontWeight: '600' },
});
