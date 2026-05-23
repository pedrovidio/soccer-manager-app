import React, { memo, useCallback } from 'react';
import { FlatList, Text, TouchableOpacity } from 'react-native';
import { styles } from './styles';
import { ChipRowProps, SelectOption } from './types';

function ChipRowComponent({ options, selectedValue, onSelect }: ChipRowProps) {
  const renderItem = useCallback(({ item }: { item: SelectOption }) => {
    const active = selectedValue === item.value;

    return (
      <TouchableOpacity
        style={[styles.chip, active ? styles.chipActive : null]}
        onPress={() => onSelect(item.value)}
      >
        <Text style={[styles.chipText, active ? styles.chipTextActive : null]}>{item.label}</Text>
      </TouchableOpacity>
    );
  }, [onSelect, selectedValue]);

  return (
    <FlatList
      data={options}
      keyExtractor={(item) => String(item.value)}
      renderItem={renderItem}
      horizontal
      contentContainerStyle={styles.chipList}
      showsHorizontalScrollIndicator={false}
    />
  );
}

export const ChipRow = memo(ChipRowComponent);
