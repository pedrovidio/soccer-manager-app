import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Switch, StyleSheet, Modal, Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '../../../common/theme';
import type { useEditProfileForm } from '../../hooks/useEditProfileForm';
import type { AvailabilitySlot } from '../../../auth/registerTypes';

type Props = Pick<
  ReturnType<typeof useEditProfileForm>,
  'wantsAvailability' | 'setWantsAvailability' | 'slots' | 'setSlots'
>;

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function timeToDate(time: string): Date {
  const [h, m] = time.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function dateToTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export default function StepDisponibilidade({ wantsAvailability, setWantsAvailability, slots, setSlots }: Props) {
  const [pickerTarget, setPickerTarget] = useState<{ index: number; field: 'startTime' | 'endTime' } | null>(null);

  function addSlot() {
    setSlots([...slots, { dayOfWeek: 1, startTime: '08:00', endTime: '10:00' }]);
  }

  function removeSlot(index: number) {
    setSlots(slots.filter((_, i) => i !== index));
  }

  function updateSlot(index: number, patch: Partial<AvailabilitySlot>) {
    setSlots(slots.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  function onTimeChange(_: any, date?: Date) {
    if (!pickerTarget || !date) { setPickerTarget(null); return; }
    updateSlot(pickerTarget.index, { [pickerTarget.field]: dateToTime(date) });
    setPickerTarget(null);
  }

  const pickerValue = pickerTarget
    ? timeToDate(slots[pickerTarget.index]?.[pickerTarget.field] ?? '08:00')
    : new Date();

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

      {/* Toggle principal */}
      <View style={s.card}>
        <View style={s.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.switchLabel}>Quero jogar como avulso</Text>
            <Text style={s.switchDesc}>Defina seus horários disponíveis para partidas</Text>
          </View>
          <Switch
            value={wantsAvailability} onValueChange={setWantsAvailability}
            trackColor={{ false: Colors.n300, true: Colors.primary }}
            thumbColor={Colors.white}
          />
        </View>
      </View>

      {wantsAvailability && (
        <>
          {slots.map((slot, index) => (
            <View key={index} style={s.slotCard}>
              <View style={s.slotHeader}>
                <Text style={s.slotTitle}>Horário {index + 1}</Text>
                <TouchableOpacity onPress={() => removeSlot(index)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="trash-outline" size={18} color={Colors.error} />
                </TouchableOpacity>
              </View>

              {/* Dia da semana */}
              <Text style={s.fieldLabel}>Dia da semana</Text>
              <View style={s.daysRow}>
                {DAYS.map((day, di) => (
                  <TouchableOpacity
                    key={di}
                    style={[s.dayChip, slot.dayOfWeek === di && s.dayChipActive]}
                    onPress={() => updateSlot(index, { dayOfWeek: di })}
                  >
                    <Text style={[s.dayChipText, slot.dayOfWeek === di && s.dayChipTextActive]}>{day}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Horários */}
              <View style={s.timeRow}>
                <View style={s.timeBlock}>
                  <Text style={s.fieldLabel}>Início</Text>
                  <TouchableOpacity
                    style={s.timeBtn}
                    onPress={() => setPickerTarget({ index, field: 'startTime' })}
                  >
                    <Ionicons name="time-outline" size={16} color={Colors.primary} />
                    <Text style={s.timeBtnText}>{slot.startTime}</Text>
                  </TouchableOpacity>
                </View>
                <View style={s.timeBlock}>
                  <Text style={s.fieldLabel}>Fim</Text>
                  <TouchableOpacity
                    style={s.timeBtn}
                    onPress={() => setPickerTarget({ index, field: 'endTime' })}
                  >
                    <Ionicons name="time-outline" size={16} color={Colors.primary} />
                    <Text style={s.timeBtnText}>{slot.endTime}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}

          <TouchableOpacity style={s.addBtn} onPress={addSlot}>
            <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
            <Text style={s.addBtnText}>Adicionar horário</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Time picker */}
      {pickerTarget !== null && (
        Platform.OS === 'ios' ? (
          <Modal transparent animationType="slide">
            <View style={s.modalOverlay}>
              <View style={s.modalSheet}>
                <View style={s.modalHeader}>
                  <Text style={s.modalTitle}>
                    {pickerTarget.field === 'startTime' ? 'Horário de início' : 'Horário de fim'}
                  </Text>
                  <TouchableOpacity onPress={() => setPickerTarget(null)}>
                    <Text style={s.modalDone}>Feito</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={pickerValue} mode="time" display="spinner"
                  onChange={onTimeChange} locale="pt-BR"
                />
              </View>
            </View>
          </Modal>
        ) : (
          <DateTimePicker
            value={pickerValue} mode="time" display="default"
            onChange={onTimeChange}
          />
        )
      )}

    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll:           { padding: Spacing.lg, paddingBottom: 24, gap: 12 },
  card:             { backgroundColor: Colors.white, borderRadius: Radius.r12, borderWidth: 0.5, borderColor: Colors.n200, padding: Spacing.lg },
  switchRow:        { flexDirection: 'row', alignItems: 'center', gap: 12 },
  switchLabel:      { fontSize: 13, fontWeight: '600', color: Colors.n800 },
  switchDesc:       { fontSize: 11, color: Colors.n500, marginTop: 2 },
  slotCard:         { backgroundColor: Colors.white, borderRadius: Radius.r12, borderWidth: 0.5, borderColor: Colors.n200, padding: Spacing.lg, gap: 10 },
  slotHeader:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  slotTitle:        { fontSize: 13, fontWeight: '700', color: Colors.n900 },
  fieldLabel:       { fontSize: 12, fontWeight: '600', color: Colors.n700, marginBottom: 6 },
  daysRow:          { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  dayChip:          { width: 38, height: 38, borderRadius: Radius.r8, borderWidth: 1.5, borderColor: Colors.n300, alignItems: 'center', justifyContent: 'center' },
  dayChipActive:    { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  dayChipText:      { fontSize: 11, fontWeight: '600', color: Colors.n500 },
  dayChipTextActive:{ color: Colors.primary },
  timeRow:          { flexDirection: 'row', gap: 12 },
  timeBlock:        { flex: 1 },
  timeBtn:          { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.primaryLight, borderRadius: Radius.r8, paddingHorizontal: 12, paddingVertical: 10 },
  timeBtnText:      { fontSize: 14, fontWeight: '700', color: Colors.primary },
  addBtn:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: Radius.r12, borderWidth: 1.5, borderColor: Colors.primary, borderStyle: 'dashed' },
  addBtnText:       { fontSize: 14, fontWeight: '600', color: Colors.primary },
  modalOverlay:     { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet:       { backgroundColor: Colors.white, borderTopLeftRadius: Radius.r24, borderTopRightRadius: Radius.r24, paddingBottom: 32 },
  modalHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg, borderBottomWidth: 0.5, borderBottomColor: Colors.n200 },
  modalTitle:       { fontSize: 15, fontWeight: '700', color: Colors.n900 },
  modalDone:        { fontSize: 15, fontWeight: '700', color: Colors.primary },
});
