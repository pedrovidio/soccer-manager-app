import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Radius } from '../../../common/theme';
import type { useEditProfileForm } from '../../hooks/useEditProfileForm';
import { SwitchRow, TimeSelect } from '../../../common/components/form/FormElements';

type Props = Pick<
  ReturnType<typeof useEditProfileForm>,
  | 'wantsAvailability' | 'setWantsAvailability'
  | 'slots' | 'setSlots'
>;

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function StepDisponibilidade(props: Props) {
  const { wantsAvailability, setWantsAvailability, slots: availabilitySlots, setSlots: setAvailabilitySlots } = props;

  function pad2(n: string | number) { return String(n).padStart(2, '0'); }
  function addOneHour(time: string) {
    const [h, m] = time.split(':').map(Number);
    let nh = (h + 1) % 24;
    return pad2(nh) + ':' + pad2(m);
  }

  function toggleDay(day: number) {
    const exists = availabilitySlots.some((s) => s.dayOfWeek === day);
    if (exists) {
      setAvailabilitySlots(availabilitySlots.filter((s) => s.dayOfWeek !== day));
    } else {
      setAvailabilitySlots([...availabilitySlots, { dayOfWeek: day, startTime: '18:00', endTime: '20:00' }]);
    }
  }

  function handleStartTimeChange(idx: number, timeStr: string) {
    const endTime = addOneHour(timeStr);
    const updated = availabilitySlots.map((s, i) => i === idx ? { ...s, startTime: timeStr, endTime } : s);
    setAvailabilitySlots(updated);
  }

  function handleEndTimeChange(idx: number, timeStr: string) {
    const updated = availabilitySlots.map((s, i) => i === idx ? { ...s, endTime: timeStr } : s);
    setAvailabilitySlots(updated);
  }

  const sortedSlots = [...availabilitySlots].sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  return (
    <View>
      <Text style={s.stepTitle}>Disponibilidade</Text>
      <Text style={s.stepSubtitle}>Informe quando você está disponível para partidas avulsas</Text>

      <SwitchRow
        label="Quero receber convites para partidas"
        desc="Você aparecerá para times buscando jogadores avulsos"
        value={wantsAvailability}
        onValueChange={(v) => {
          setWantsAvailability(v);
          if (!v) setAvailabilitySlots([]);
        }}
      />

      {wantsAvailability && (
        <>
          <Text style={s.sectionLabel}>Dias disponíveis</Text>
          <View style={s.daysRow}>
            {DAYS.map((label, day) => {
              const active = availabilitySlots.some((s) => s.dayOfWeek === day);
              return (
                <TouchableOpacity
                  key={day}
                  style={[s.dayChip, active && s.dayChipActive]}
                  onPress={() => toggleDay(day)}
                >
                  <Text style={[s.dayChipText, active && s.dayChipTextActive]}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {sortedSlots.length > 0 && (
            <View style={{ marginTop: 16 }}>
              <Text style={s.sectionLabel}>Defina os horários</Text>
              {sortedSlots.map((slot) => {
                const idx = availabilitySlots.findIndex((s) => s.dayOfWeek === slot.dayOfWeek);
                return (
                  <View key={slot.dayOfWeek} style={s.slotCard}>
                    <View style={s.slotCardHeader}>
                      <Text style={s.slotDayLabel}>{DAYS[slot.dayOfWeek]}</Text>
                      <TouchableOpacity onPress={() => toggleDay(slot.dayOfWeek)}>
                        <Text style={s.slotRemove}>Remover</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={s.slotTimeRow}>
                      <View style={s.timeBlock}>
                        <Text style={s.timeLabel}>Início</Text>
                        <TimeSelect value={slot.startTime} onChange={(v) => handleStartTimeChange(idx, v)} />
                      </View>
                      <View style={s.timeDiv}>
                         <Text style={s.timeDivText}>até</Text>
                      </View>
                      <View style={s.timeBlock}>
                        <Text style={s.timeLabel}>Fim</Text>
                        <TimeSelect value={slot.endTime} onChange={(v) => handleEndTimeChange(idx, v)} />
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {sortedSlots.length === 0 && (
            <View style={s.emptySlots}>
              <Text style={s.emptySlotsText}>Selecione ao menos um dia acima</Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  stepTitle:       { fontSize: 22, fontWeight: '800', color: Colors.n900, marginBottom: 4 },
  stepSubtitle:    { fontSize: 13, color: Colors.n500, marginBottom: 20 },
  sectionLabel:    { fontSize: 13, fontWeight: '700', color: Colors.n700, marginBottom: 10 },
  daysRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  dayChip:        { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: Colors.n300, backgroundColor: Colors.white },
  dayChipActive:  { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  dayChipText:    { fontSize: 11, fontWeight: '600', color: Colors.n700 },
  dayChipTextActive: { color: Colors.primary },
  slotCard:       { backgroundColor: Colors.white, borderRadius: Radius.r12, borderWidth: 1, borderColor: Colors.n200, padding: 16, marginBottom: 12 },
  slotCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  slotDayLabel:   { fontSize: 15, fontWeight: '700', color: Colors.n900 },
  slotRemove:     { fontSize: 13, fontWeight: '600', color: Colors.error },
  slotTimeRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  timeBlock:      { flex: 1 },
  timeLabel:      { fontSize: 12, fontWeight: '600', color: Colors.n500, marginBottom: 6 },
  timeDiv:        { paddingHorizontal: 12, justifyContent: 'flex-end', paddingBottom: 10 },
  timeDivText:    { fontSize: 13, color: Colors.n500 },
  emptySlots:     { alignItems: 'center', paddingVertical: 16 },
  emptySlotsText: { fontSize: 13, color: Colors.n400 },
});
