import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Arena, Radius, Spacing } from '@ui/tokens/theme';
import { useAvailabilityLogic } from './useAvailabilityLogic';

const DAYS = ['Domingo', 'Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado'];

export const AvailabilityFormView = () => {
  const { fields, append, remove, update, onSubmit, isPending } = useAvailabilityLogic();
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'startTime' | 'endTime'>('startTime');
  const [activeIndex, setActiveFieldIndex] = useState<number | null>(null);

  const getTimeAsDate = (timeStr: string) => {
    const [h, m] = timeStr.split(':');
    const d = new Date();
    d.setHours(Number(h), Number(m), 0, 0);
    return d;
  };

  const handleTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowPicker(false);
    if (event.type === 'set' && selectedDate && activeIndex !== null) {
      const h = selectedDate.getHours().toString().padStart(2, '0');
      const m = selectedDate.getMinutes().toString().padStart(2, '0');
      const currentField = fields[activeIndex];
      update(activeIndex, { ...currentField, [pickerMode]: `${h}:${m}` });
    }
    setActiveFieldIndex(null);
  };

  const openClock = (index: number, mode: 'startTime' | 'endTime') => {
    setActiveFieldIndex(index);
    setPickerMode(mode);
    setShowPicker(true);
  };

  return (
    <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Sua Agenda</Text>
        <Text style={styles.subtitle}>
          Defina os dias e horarios que voce costuma estar livre para jogar. O sistema usara isso para te encontrar vagas.
        </Text>
      </View>

      {fields.map((field, index) => (
        <View key={field.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Dia da Semana</Text>
            <TouchableOpacity onPress={() => remove(index)} style={styles.iconButton}>
              <MaterialCommunityIcons name="trash-can-outline" size={20} color={Arena.error} />
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daysScroll}>
            {DAYS.map((day, dayIndex) => (
              <TouchableOpacity
                key={dayIndex}
                onPress={() => update(index, { ...field, dayOfWeek: dayIndex })}
                style={[styles.dayChip, field.dayOfWeek === dayIndex && styles.dayChipActive]}
              >
                <Text style={[styles.dayText, field.dayOfWeek === dayIndex && styles.dayTextActive]}>{day}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.timeRow}>
            <View style={styles.timeColStart}>
              <Text style={styles.timeLabel}>Inicio</Text>
              <TouchableOpacity onPress={() => openClock(index, 'startTime')} style={styles.timeButton}>
                <Text style={styles.timeText}>{field.startTime}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.timeColEnd}>
              <Text style={styles.timeLabel}>Fim</Text>
              <TouchableOpacity onPress={() => openClock(index, 'endTime')} style={styles.timeButton}>
                <Text style={styles.timeText}>{field.endTime}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}

      <TouchableOpacity onPress={() => append({ dayOfWeek: 1, startTime: '18:00', endTime: '20:00' })} style={styles.addButton}>
        <MaterialCommunityIcons name="plus" size={20} color={Arena.neon} />
        <Text style={styles.addText}>Adicionar Horario</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onSubmit} disabled={isPending} style={[styles.submitButton, isPending && styles.disabled]}>
        {isPending ? <ActivityIndicator color={Arena.buttonLabelPrimary} /> : <Text style={styles.submitText}>Finalizar Cadastro</Text>}
      </TouchableOpacity>

      {showPicker && activeIndex !== null && (
        <DateTimePicker
          value={getTimeAsDate(fields[activeIndex][pickerMode])}
          mode="time"
          is24Hour={true}
          display="clock"
          onChange={handleTimeChange}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: Arena.bg,
    padding: Spacing.lg,
  },
  header: {
    marginBottom: 24,
    marginTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: Arena.text,
    marginBottom: 8,
  },
  subtitle: {
    color: Arena.textMuted,
  },
  card: {
    backgroundColor: Arena.card,
    padding: 16,
    borderRadius: Radius.r16,
    borderWidth: 1,
    borderColor: Arena.line,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontWeight: '700',
    color: Arena.text,
  },
  iconButton: {
    padding: 4,
  },
  daysScroll: {
    marginBottom: 16,
  },
  dayChip: {
    marginRight: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.r999,
    borderWidth: 1,
    backgroundColor: Arena.cardSoft,
    borderColor: Arena.line,
  },
  dayChipActive: {
    backgroundColor: Arena.neon,
    borderColor: Arena.neon,
  },
  dayText: {
    color: Arena.textMuted,
  },
  dayTextActive: {
    color: Arena.buttonLabelPrimary,
    fontWeight: '700',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeColStart: {
    flex: 1,
    marginRight: 8,
  },
  timeColEnd: {
    flex: 1,
    marginLeft: 8,
  },
  timeLabel: {
    fontSize: 12,
    color: Arena.textMuted,
    marginBottom: 4,
  },
  timeButton: {
    backgroundColor: Arena.graphiteElevated,
    padding: 12,
    borderRadius: Radius.r12,
    borderWidth: 1,
    borderColor: Arena.line,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 18,
    fontWeight: '900',
    color: Arena.text,
  },
  addButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 24,
    backgroundColor: Arena.neonSoft,
    borderRadius: Radius.r12,
    borderWidth: 1,
    borderColor: Arena.neonBorder,
    borderStyle: 'dashed',
  },
  addText: {
    color: Arena.neon,
    fontWeight: '700',
    marginLeft: 4,
  },
  submitButton: {
    backgroundColor: Arena.neon,
    paddingVertical: 16,
    borderRadius: Radius.r12,
    alignItems: 'center',
    marginBottom: 40,
  },
  disabled: {
    opacity: 0.7,
  },
  submitText: {
    color: Arena.buttonLabelPrimary,
    fontWeight: '700',
    fontSize: 18,
  },
});
