import React, { memo, useCallback, useMemo } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SwitchRow, TimeSelect } from '@ui/primitives';
import { AvailabilitySlot } from '@features/auth/registerTypes';
import { DAYS } from './options';
import { addOneHour } from './registerUtils';
import { styles } from './styles';
import { RegisterStepProps } from './types';

function RegisterAvailabilityStepComponent({ form, setField }: RegisterStepProps) {
  const sortedSlots = useMemo(
    () => [...form.availabilitySlots].sort((a, b) => a.dayOfWeek - b.dayOfWeek),
    [form.availabilitySlots],
  );

  const toggleDay = useCallback((day: number) => {
    const exists = form.availabilitySlots.some((slot) => slot.dayOfWeek === day);
    const nextSlots = exists
      ? form.availabilitySlots.filter((slot) => slot.dayOfWeek !== day)
      : [...form.availabilitySlots, { dayOfWeek: day, startTime: '18:00', endTime: '20:00' }];

    setField('availabilitySlots', nextSlots);
  }, [form.availabilitySlots, setField]);

  const handleStartTimeChange = useCallback((dayOfWeek: number, time: string) => {
    const nextSlots = form.availabilitySlots.map((slot) => (
      slot.dayOfWeek === dayOfWeek ? { ...slot, startTime: time, endTime: addOneHour(time) } : slot
    ));

    setField('availabilitySlots', nextSlots);
  }, [form.availabilitySlots, setField]);

  const handleEndTimeChange = useCallback((dayOfWeek: number, time: string) => {
    const nextSlots = form.availabilitySlots.map((slot) => (
      slot.dayOfWeek === dayOfWeek ? { ...slot, endTime: time } : slot
    ));

    setField('availabilitySlots', nextSlots);
  }, [form.availabilitySlots, setField]);

  const handleAvailabilityChange = useCallback((value: boolean) => {
    setField('wantsAvailability', value);
    if (!value) {
      setField('availabilitySlots', []);
    }
  }, [setField]);

  const renderDay = useCallback(({ item, index }: { item: string; index: number }) => {
    const active = form.availabilitySlots.some((slot) => slot.dayOfWeek === index);

    return (
      <TouchableOpacity
        style={[styles.dayChip, active ? styles.dayChipActive : null]}
        onPress={() => toggleDay(index)}
      >
        <Text style={[styles.dayChipText, active ? styles.dayChipTextActive : null]}>{item}</Text>
      </TouchableOpacity>
    );
  }, [form.availabilitySlots, toggleDay]);

  const renderSlot = useCallback(({ item }: { item: AvailabilitySlot }) => (
    <View style={styles.slotCard}>
      <View style={styles.slotCardHeader}>
        <Text style={styles.slotDayLabel}>{DAYS[item.dayOfWeek]}</Text>
        <TouchableOpacity onPress={() => toggleDay(item.dayOfWeek)}>
          <Text style={styles.slotRemove}>Remover</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.slotTimeRow}>
        <View style={styles.timeBlock}>
          <Text style={styles.timeLabel}>Início</Text>
          <TimeSelect value={item.startTime} onChange={(value) => handleStartTimeChange(item.dayOfWeek, value)} />
        </View>
        <View style={styles.timeDiv}>
          <Text style={styles.timeDivText}>até</Text>
        </View>
        <View style={styles.timeBlock}>
          <Text style={styles.timeLabel}>Fim</Text>
          <TimeSelect value={item.endTime} onChange={(value) => handleEndTimeChange(item.dayOfWeek, value)} />
        </View>
      </View>
    </View>
  ), [handleEndTimeChange, handleStartTimeChange, toggleDay]);

  return (
    <View>
      <Text style={styles.stepTitle}>Disponibilidade</Text>
      <Text style={styles.stepSubtitle}>Informe quando você está disponível para partidas avulsas</Text>

      <SwitchRow
        label="Quero receber convites para partidas"
        desc="Você aparecerá para times buscando jogadores avulsos"
        value={form.wantsAvailability}
        onValueChange={handleAvailabilityChange}
      />

      {form.wantsAvailability && (
        <>
          <Text style={styles.sectionLabel}>Dias disponíveis</Text>
          <FlatList
            data={DAYS}
            horizontal
            keyExtractor={(item) => item}
            renderItem={renderDay}
            contentContainerStyle={styles.daysList}
            showsHorizontalScrollIndicator={false}
          />

          {sortedSlots.length > 0 ? (
            <View style={styles.slotList}>
              <Text style={styles.sectionLabel}>Defina os horários</Text>
              <FlatList
                data={sortedSlots}
                keyExtractor={(item) => String(item.dayOfWeek)}
                renderItem={renderSlot}
                scrollEnabled={false}
              />
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

export const RegisterAvailabilityStep = memo(RegisterAvailabilityStepComponent);
