import React, { memo } from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { Arena } from '@ui/tokens/theme';
import { formatDate, formatTime } from './createMatchFormatters';
import { styles } from './styles';

type DateTimeFieldsProps = {
  date: Date;
  showDatePicker: boolean;
  showTimePicker: boolean;
  onDatePress: () => void;
  onTimePress: () => void;
  onDateChange: (event: DateTimePickerEvent, selected?: Date) => void;
  onTimeChange: (event: DateTimePickerEvent, selected?: Date) => void;
};

function DateTimeFieldsComponent({
  date,
  showDatePicker,
  showTimePicker,
  onDatePress,
  onTimePress,
  onDateChange,
  onTimeChange,
}: DateTimeFieldsProps) {
  return (
    <>
      <View style={styles.row}>
        <View style={styles.flex1}>
          <Text style={styles.label}>Data</Text>
          <TouchableOpacity style={styles.pickerBtn} onPress={onDatePress} activeOpacity={0.7}>
            <Ionicons name="calendar-outline" size={16} color={Arena.neon} />
            <Text style={styles.pickerBtnText}>{formatDate(date)}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.flex1}>
          <Text style={styles.label}>Hora</Text>
          <TouchableOpacity style={styles.pickerBtn} onPress={onTimePress} activeOpacity={0.7}>
            <Ionicons name="time-outline" size={16} color={Arena.neon} />
            <Text style={styles.pickerBtnText}>{formatTime(date)}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          minimumDate={new Date()}
          onChange={onDateChange}
          locale="pt-BR"
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={date}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          is24Hour
          onChange={onTimeChange}
        />
      )}
    </>
  );
}

export const DateTimeFields = memo(DateTimeFieldsComponent);
