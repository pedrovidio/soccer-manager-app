import React, { memo, useCallback } from 'react';
import { Input } from '@ui/primitives';
import { Field } from './Field';
import { styles } from './styles';

type Props = {
  index: number;
  value: string;
  editable: boolean;
  onChange: (index: number, value: string) => void;
};

function TeamNameInputComponent({ index, value, editable, onChange }: Props) {
  const handleChange = useCallback((text: string) => onChange(index, text), [index, onChange]);

  return (
    <Field label={`Time ${index + 1} *`}>
      <Input
        style={!editable ? styles.inputDisabled : null}
        placeholder={`Time ${index + 1}`}
        value={value}
        onChangeText={handleChange}
        maxLength={40}
        editable={editable}
      />
    </Field>
  );
}

export const TeamNameInput = memo(TeamNameInputComponent);
