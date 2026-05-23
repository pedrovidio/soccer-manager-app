import { Dimensions, StyleSheet } from 'react-native';
import { Colors, Radius, Spacing } from '../../../../ui/tokens/theme';

const MENU_PADDING = 3;
const MENU_HEIGHT = 40;
const MENU_ITEM_HEIGHT = MENU_HEIGHT - MENU_PADDING * 2;
const MENU_HORIZONTAL_SPACE = Spacing.lg * 2 + MENU_PADDING * 2;
const MENU_ITEM_WIDTH = (Dimensions.get('window').width - MENU_HORIZONTAL_SPACE) / 4;

export const styles = StyleSheet.create({
  wrap: {
    flexGrow: 0,
    flexShrink: 0,
    alignSelf: 'stretch',
    height: MENU_HEIGHT,
    minHeight: MENU_HEIGHT,
    maxHeight: MENU_HEIGHT,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
    backgroundColor: Colors.n100,
    borderRadius: Radius.r8,
    padding: MENU_PADDING,
    overflow: 'hidden',
  },
  item: {
    width: MENU_ITEM_WIDTH,
    height: MENU_ITEM_HEIGHT,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.r8 - 2,
    paddingHorizontal: 2,
  },
  itemActive: { backgroundColor: Colors.white },
  text: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: Colors.n500,
    textAlign: 'center',
    includeFontPadding: false,
  },
  textActive: { color: Colors.primary },
});
