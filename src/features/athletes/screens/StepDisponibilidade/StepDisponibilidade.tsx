import React, { useCallback, useMemo } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { TimeSelect, SwitchRow } from '../../../../ui/primitives';
import { AvailabilitySlot } from '../../../auth/registerTypes';
import { addOneHour, DAYS } from './availabilityUtils';
import { styles } from './styles';
import { StepDisponibilidadeProps } from './types';

export default function StepDisponibilidade({ wantsAvailability, setWantsAvailability, slots, setSlots }: StepDisponibilidadeProps) {
  const sortedSlots = useMemo(() => [...slots].sort((a, b) => a.dayOfWeek - b.dayOfWeek), [slots]);

  const toggleDay = useCallback((day: number) => {
    const exists = slots.some((slot) => slot.dayOfWeek === day);
    setSlots(exists
      ? slots.filter((slot) => slot.dayOfWeek !== day)
      : [...slots, { dayOfWeek: day, startTime: '18:00', endTime: '20:00' }]);
  }, [setSlots, slots]);

  const handleStartTimeChange = useCallback((idx: number, timeStr: string) => {
    const endTime = addOneHour(timeStr);
    setSlots(slots.map((slot, index) => index === idx ? { ...slot, startTime: timeStr, endTime } : slot));
  }, [setSlots, slots]);

  const handleEndTimeChange = useCallback((idx: number, timeStr: string) => {
    setSlots(slots.map((slot, index) => index === idx ? { ...slot, endTime: timeStr } : slot));
  }, [setSlots, slots]);

  const renderDay = useCallback(({ item, index }: { item: string; index: number }) => {
    const active = slots.some((slot) => slot.dayOfWeek === index);
    return (
      <TouchableOpacity style={[styles.dayChip, active && styles.dayChipActive]} onPress={() => toggleDay(index)}>
        <Text style={[styles.dayChipText, active && styles.dayChipTextActive]}>{item}</Text>
      </TouchableOpacity>
    );
  }, [slots, toggleDay]);

  const renderSlot = useCallback(({ item }: { item: AvailabilitySlot }) => {
    const idx = slots.findIndex((slot) => slot.dayOfWeek === item.dayOfWeek);
    return (
      <View style={styles.slotCard}>
        <View style={styles.slotCardHeader}>
          <Text style={styles.slotDayLabel}>{DAYS[item.dayOfWeek]}</Text>
          <TouchableOpacity onPress={() => toggleDay(item.dayOfWeek)}>
            <Text style={styles.slotRemove}>Remover</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.slotTimeRow}>
          <View style={styles.timeBlock}>
            <Text style={styles.timeLabel}>Inicio</Text>
            <TimeSelect value={item.startTime} onChange={(value) => handleStartTimeChange(idx, value)} />
          </View>
          <View style={styles.timeDiv}><Text style={styles.timeDivText}>ate</Text></View>
          <View style={styles.timeBlock}>
            <Text style={styles.timeLabel}>Fim</Text>
            <TimeSelect value={item.endTime} onChange={(value) => handleEndTimeChange(idx, value)} />
          </View>
        </View>
      </View>
    );
  }, [handleEndTimeChange, handleStartTimeChange, slots, toggleDay]);

  return (
    <View>
      <Text style={styles.stepTitle}>Disponibilidade</Text>
      <Text style={styles.stepSubtitle}>Informe quando voce esta disponivel para partidas avulsas</Text>

      <SwitchRow
        label="Quero receber convites para partidas"
        desc="Voce aparecera para times buscando jogadores avulsos"
        value={wantsAvailability}
        onValueChange={(value) => {
          setWantsAvailability(value);
          if (!value) setSlots([]);
        }}
      />

      {wantsAvailability && (
        <>
          <Text style={styles.sectionLabel}>Dias disponiveis</Text>
          <FlatList data={DAYS} keyExtractor={(item) => item} renderItem={renderDay} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysRow} />
          {sortedSlots.length > 0 ? (
            <View style={styles.slotsWrap}>
              <Text style={styles.sectionLabel}>Defina os horarios</Text>
              <FlatList data={sortedSlots} keyExtractor={(item) => String(item.dayOfWeek)} renderItem={renderSlot} scrollEnabled={false} />
            </View>
          ) : (
            <View style={styles.emptySlots}>
              <Text style={styles.emptySlotsText}>Selecione ao menos um dia acima</Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}
