import React, { memo, useCallback, useState } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { UF_LIST } from './options';
import { SelectModal } from './SelectModal';
import { styles } from './styles';
import { SimpleSelectProps } from './types';

function UFSelectComponent({ value, onChange }: SimpleSelectProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = useCallback((nextValue: string) => {
    onChange(nextValue);
    setOpen(false);
  }, [onChange]);

  return (
    <>
      <TouchableOpacity style={styles.selectBtn} onPress={() => setOpen(true)}>
        <Text style={[styles.selectBtnText, !value ? styles.selectBtnPlaceholder : null]}>
          {value || 'Selecione o estado'}
        </Text>
        <Text style={styles.selectArrow}>▾</Text>
      </TouchableOpacity>

      <SelectModal
        visible={open}
        title="Selecione o estado"
        options={UF_LIST}
        value={value}
        onClose={() => setOpen(false)}
        onSelect={handleSelect}
      />
    </>
  );
}

export const UFSelect = memo(UFSelectComponent);
