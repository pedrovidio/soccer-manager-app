import React, { memo, ReactNode } from 'react';
import { Text, View } from 'react-native';
import { styles } from './styles';

type Props = {
  label: string;
  children: ReactNode;
};

function FieldComponent({ label, children }: Props) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

export const Field = memo(FieldComponent);
