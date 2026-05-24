import React, { memo, useCallback } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { MATCH_TYPES } from './options';
import { styles } from './styles';
import { MatchType, MatchTypeOption } from './types';

type MatchTypeSelectorProps = {
  value: MatchType;
  onChange: (option: MatchTypeOption) => void;
};

function MatchTypeSelectorComponent({ value, onChange }: MatchTypeSelectorProps) {
  const renderItem = useCallback(({ item }: { item: MatchTypeOption }) => {
    const active = value === item.value;

    return (
      <TouchableOpacity
        style={[styles.segment, active ? styles.segmentActive : null]}
        onPress={() => onChange(item)}
        activeOpacity={0.7}
      >
        <Text style={[styles.segmentText, active ? styles.segmentTextActive : null]}>{item.label}</Text>
      </TouchableOpacity>
    );
  }, [onChange, value]);

  return (
    <View>
      <Text style={styles.label}>Tipo de partida</Text>
      <View style={styles.segmented}>
        <FlatList
          data={MATCH_TYPES}
          keyExtractor={(item) => item.value}
          renderItem={renderItem}
          horizontal
          scrollEnabled={false}
        />
      </View>
    </View>
  );
}

export const MatchTypeSelector = memo(MatchTypeSelectorComponent);
