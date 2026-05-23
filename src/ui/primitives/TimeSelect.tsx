import React, { memo, useCallback, useState } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { TIME_OPTIONS } from './options';
import { SelectModal } from './SelectModal';
import { styles } from './styles';
import { SimpleSelectProps } from './types';

function TimeSelectComponent({ value, onChange }: SimpleSelectProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = useCallback((nextValue: string) => {
    onChange(nextValue);
    setOpen(false);
  }, [onChange]);

  return (
    <>
      <TouchableOpacity style={styles.selectBtn} onPress={() => setOpen(true)}>
        <Text style={styles.timeBtnText}>{value || '00:00'}</Text>
        <Text style={styles.selectArrow}>▾</Text>
      </TouchableOpacity>

      <SelectModal
        visible={open}
        title="Selecione o horário"
        options={TIME_OPTIONS}
        value={value}
        onClose={() => setOpen(false)}
        onSelect={handleSelect}
      />
    </>
  );
}

export const TimeSelect = memo(TimeSelectComponent);
