import React, { memo } from 'react';
import { Text, View } from 'react-native';
import { SegmentedControl } from '@ui/primitives/SegmentedControl';
import { MATCH_TYPES } from './options';
import { styles } from './styles';
import { MatchType, MatchTypeOption } from './types';

type MatchTypeSelectorProps = {
  value: MatchType;
  onChange: (option: MatchTypeOption) => void;
};

function MatchTypeSelectorComponent({ value, onChange }: MatchTypeSelectorProps) {
  const options = MATCH_TYPES.map((item) => ({
    value: item.value,
    label: item.label,
  }));

  const handleChange = (val: MatchType) => {
    const selected = MATCH_TYPES.find((item) => item.value === val);
    if (selected) {
      onChange(selected);
    }
  };

  return (
    <View>
      <Text style={styles.label}>Tipo de partida</Text>
      <SegmentedControl
        options={options}
        value={value}
        onChange={handleChange}
      />
    </View>
  );
}

export const MatchTypeSelector = memo(MatchTypeSelectorComponent);
