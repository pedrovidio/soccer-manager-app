import React, { memo, ReactNode } from 'react';
import { Text, View } from 'react-native';
import { styles } from './styles';

type FieldProps = {
  label: string;
  children: ReactNode;
};

function FieldComponent({ label, children }: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

export const Field = memo(FieldComponent);
