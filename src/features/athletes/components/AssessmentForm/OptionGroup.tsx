import React, { memo, useCallback } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { styles } from './styles';

type Option = {
  id: string;
  label: string;
};

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  options: Option[];
  title: string;
};

function OptionGroupComponent<T extends FieldValues>({ control, name, options, title }: Props<T>) {
  return (
    <>
      <Text style={styles.optionTitle}>{title}</Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => (
          <FlatList
            data={options}
            keyExtractor={(item) => item.id}
            horizontal={false}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.optionGridRow}
            contentContainerStyle={styles.optionGrid}
            renderItem={({ item }) => (
              <OptionChip option={item} selected={value === item.id} onPress={() => onChange(item.id)} />
            )}
          />
        )}
      />
    </>
  );
}

function OptionChip({ option, selected, onPress }: { option: Option; selected: boolean; onPress: () => void }) {
  const handlePress = useCallback(onPress, [onPress]);
  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[styles.optionChip, selected && styles.optionChipSelected]}
    >
      <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{option.label}</Text>
    </TouchableOpacity>
  );
}

export const OptionGroup = memo(OptionGroupComponent) as typeof OptionGroupComponent;
