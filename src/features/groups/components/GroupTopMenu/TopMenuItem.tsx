import React, { memo } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { GroupTopMenuItem } from './types';
import { styles } from './styles';

type Props = {
  item: GroupTopMenuItem;
  active: boolean;
  onPress: (item: GroupTopMenuItem) => void;
};

function TopMenuItemComponent({ item, active, onPress }: Props) {
  return (
    <TouchableOpacity
      style={[styles.item, active && styles.itemActive]}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, active && styles.textActive]}>{item.label}</Text>
    </TouchableOpacity>
  );
}

export const TopMenuItem = memo(TopMenuItemComponent);
