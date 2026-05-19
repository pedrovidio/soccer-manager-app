import React, { memo, useCallback } from 'react';
import { FlatList, Text, TextInput, View } from 'react-native';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { AssessmentFormData } from '../../schemas/assessmentSchema';
import { STAT_FIELDS } from './options';
import { styles } from './styles';

type Props = {
  control: Control<AssessmentFormData>;
  errors: FieldErrors<AssessmentFormData>;
};

function StatsGridComponent({ control, errors }: Props) {
  const renderStat = useCallback(({ item }: { item: (typeof STAT_FIELDS)[number] }) => (
    <Controller
      control={control}
      name={item.key}
      render={({ field: { onChange, value } }) => (
        <View className="w-[48%] mb-4">
          <Text className="text-sm text-neutral-600 font-medium mb-1">{item.label}</Text>
          <TextInput
            className="bg-white border border-neutral-200 rounded-xl px-4 py-3 text-neutral-800 font-semibold"
            keyboardType="numeric"
            maxLength={3}
            value={String(value)}
            onChangeText={(val) => onChange(Number(val.replace(/[^0-9]/g, '')))}
          />
          {errors[item.key] && (
            <Text className="text-red-500 text-xs mt-1">{errors[item.key]?.message as string}</Text>
          )}
        </View>
      )}
    />
  ), [control, errors]);

  return (
    <FlatList
      data={STAT_FIELDS}
      keyExtractor={(item) => item.key}
      renderItem={renderStat}
      numColumns={2}
      scrollEnabled={false}
      columnWrapperStyle={styles.statGridRow}
    />
  );
}

export const StatsGrid = memo(StatsGridComponent);
