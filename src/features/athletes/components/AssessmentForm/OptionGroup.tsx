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
      <Text className="text-sm font-bold text-neutral-700 mb-2">{title}</Text>
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
      className={`px-4 py-2 rounded-full border ${selected ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-neutral-200'}`}
    >
      <Text className={selected ? 'text-white font-bold text-sm' : 'text-neutral-600 text-sm'}>{option.label}</Text>
    </TouchableOpacity>
  );
}

export const OptionGroup = memo(OptionGroupComponent) as typeof OptionGroupComponent;
