import React, { memo } from 'react';
import { Text, View } from 'react-native';
import { styles } from './styles';
import { FormFieldProps } from './types';

function FormFieldComponent({ label, children }: FormFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

export const FormField = memo(FormFieldComponent);
