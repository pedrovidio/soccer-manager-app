import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAvailabilityLogic } from '../../hooks/useAvailabilityLogic';

const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export const AvailabilityFormView = () => {
  const { fields, append, remove, update, onSubmit, isPending, errors } = useAvailabilityLogic();

  // Estados para controlar a exibição do relógio do sistema
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'startTime' | 'endTime'>('startTime');
  const [activeIndex, setActiveFieldIndex] = useState<number | null>(null);

  // Transforma "18:00" num objeto Date para o relógio nativo entender
  const getTimeAsDate = (timeStr: string) => {
    const [h, m] = timeStr.split(':');
    const d = new Date();
    d.setHours(Number(h), Number(m), 0, 0);
    return d;
  };

  // Função chamada quando o usuário solta o ponteiro do relógio
  const handleTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowPicker(false);
    if (event.type === 'set' && selectedDate && activeIndex !== null) {
      const h = selectedDate.getHours().toString().padStart(2, '0');
      const m = selectedDate.getMinutes().toString().padStart(2, '0');
      const timeStr = `${h}:${m}`;

      const currentField = fields[activeIndex];
      update(activeIndex, { ...currentField, [pickerMode]: timeStr });
    }
    setActiveFieldIndex(null);
  };

  const openClock = (index: number, mode: 'startTime' | 'endTime') => {
    setActiveFieldIndex(index);
    setPickerMode(mode);
    setShowPicker(true);
  };

  return (
    <ScrollView className="flex-1 bg-neutral-50 p-4" showsVerticalScrollIndicator={false}>
      <View className="mb-6 mt-4">
        <Text className="text-2xl font-black text-neutral-800 mb-2">Sua Agenda</Text>
        <Text className="text-neutral-500">Defina os dias e horários que você costuma estar livre para jogar. O sistema usará isso para te encontrar vagas.</Text>
      </View>

      {fields.map((field, index) => (
        <View key={field.id} className="bg-white p-4 rounded-2xl border border-neutral-200 mb-4 shadow-sm">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="font-bold text-neutral-700">Dia da Semana</Text>
            <TouchableOpacity onPress={() => remove(index)} className="p-1">
              <MaterialCommunityIcons name="trash-can-outline" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>

          {/* Seletor de Dia */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            {DAYS.map((day, dayIndex) => (
              <TouchableOpacity
                key={dayIndex}
                onPress={() => update(index, { ...field, dayOfWeek: dayIndex })}
                className={`mr-2 px-4 py-2 rounded-full border ${field.dayOfWeek === dayIndex ? 'bg-emerald-500 border-emerald-500' : 'bg-neutral-50 border-neutral-200'}`}
              >
                <Text className={field.dayOfWeek === dayIndex ? 'text-white font-bold' : 'text-neutral-600'}>{day}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Relógios Start e End */}
          <View className="flex-row justify-between">
            <View className="flex-1 mr-2">
              <Text className="text-xs text-neutral-500 mb-1">Início</Text>
              <TouchableOpacity onPress={() => openClock(index, 'startTime')} className="bg-neutral-100 p-3 rounded-xl border border-neutral-200 items-center">
                <Text className="text-lg font-black text-neutral-800">{field.startTime}</Text>
              </TouchableOpacity>
            </View>
            <View className="flex-1 ml-2">
              <Text className="text-xs text-neutral-500 mb-1">Fim</Text>
              <TouchableOpacity onPress={() => openClock(index, 'endTime')} className="bg-neutral-100 p-3 rounded-xl border border-neutral-200 items-center">
                <Text className="text-lg font-black text-neutral-800">{field.endTime}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}

      <TouchableOpacity onPress={() => append({ dayOfWeek: 1, startTime: '18:00', endTime: '20:00' })} className="flex-row justify-center items-center py-4 mb-6 bg-emerald-50 rounded-xl border border-emerald-100 border-dashed">
        <MaterialCommunityIcons name="plus" size={20} color="#059669" />
        <Text className="text-emerald-700 font-bold ml-1">Adicionar Horário</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onSubmit} disabled={isPending} className={`bg-emerald-600 py-4 rounded-xl items-center mb-10 ${isPending ? 'opacity-70' : ''}`}>
        {isPending ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-lg">Finalizar Cadastro</Text>}
      </TouchableOpacity>

      {/* Componente Nativo Invisível (Aparece como Popup/Modal) */}
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