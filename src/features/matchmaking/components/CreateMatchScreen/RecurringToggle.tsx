import React, { memo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../common/theme';
import { formatTime } from './createMatchFormatters';
import { styles } from './styles';

type RecurringToggleProps = {
  date: Date;
  value: boolean;
  onToggle: () => void;
};

function RecurringToggleComponent({ date, value, onToggle }: RecurringToggleProps) {
  return (
    <TouchableOpacity
      style={[styles.recurringRow, value ? styles.recurringRowActive : null]}
      onPress={onToggle}
      activeOpacity={0.8}
    >
      <View style={[styles.checkbox, value ? styles.checkboxActive : null]}>
        {value && <Ionicons name="checkmark" size={14} color={Colors.white} />}
      </View>
      <View style={styles.recurringBody}>
        <Text style={[styles.recurringLabel, value ? styles.recurringLabelActive : null]}>
          Jogo fixo (recorrente)
        </Text>
        <Text style={styles.recurringSub}>
          {value
            ? `Toda ${date.toLocaleDateString('pt-BR', { weekday: 'long' })} às ${formatTime(date)}`
            : 'Ocorre apenas nesta data'}
        </Text>
      </View>
      <Ionicons name="repeat" size={18} color={value ? Colors.primary : Colors.n400} />
    </TouchableOpacity>
  );
}

export const RecurringToggle = memo(RecurringToggleComponent);
