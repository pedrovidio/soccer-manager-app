import React, { memo } from 'react';
import { Switch, Text, View } from 'react-native';
import { Colors } from '../../../theme';
import { styles } from './styles';
import { SwitchRowProps } from './types';

function SwitchRowComponent({ label, desc, value, onValueChange }: SwitchRowProps) {
  return (
    <View style={styles.switchRow}>
      <View style={styles.switchText}>
        <Text style={styles.switchLabel}>{label}</Text>
        <Text style={styles.switchDesc}>{desc}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: Colors.n300, true: Colors.primary }}
        thumbColor={Colors.white}
      />
    </View>
  );
}

export const SwitchRow = memo(SwitchRowComponent);
