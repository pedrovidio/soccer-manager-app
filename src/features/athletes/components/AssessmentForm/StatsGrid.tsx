import React, { memo, useCallback } from 'react';
import { FlatList, Text, TextInput, View } from 'react-native';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { AssessmentFormData } from '@features/athletes/schemas/assessmentSchema';
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
        <View style={styles.statCell}>
          <Text style={styles.statLabel}>{item.label}</Text>
          <TextInput
            style={styles.statInput}
            keyboardType="numeric"
            maxLength={3}
            value={String(value)}
            onChangeText={(val) => onChange(Number(val.replace(/[^0-9]/g, '')))}
          />
          {errors[item.key] && (
            <Text style={styles.statError}>{errors[item.key]?.message as string}</Text>
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
