import React from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Controller } from 'react-hook-form';
import { useAssessmentLogic } from '../../hooks/useAssessmentLogic';
import { AssessmentFormData } from '../../schemas/assessmentSchema';

const STAT_FIELDS: Array<{ key: keyof AssessmentFormData; label: string }> = [
  { key: 'selfRatedPace', label: 'Ritmo (Pace)' },
  { key: 'selfRatedShooting', label: 'Chute' },
  { key: 'selfRatedPassing', label: 'Passe' },
  { key: 'selfRatedDribbling', label: 'Drible' },
  { key: 'selfRatedDefense', label: 'Defesa' },
  { key: 'selfRatedPhysical', label: 'Físico' },
];

const LEVEL_OPTIONS = [{ id: 'PROFESSIONAL', label: 'Profissional' }, { id: 'AMATEUR', label: 'Amador/Várzea' }, { id: 'CASUAL', label: 'Casual/Recreativo' }];
const YEARS_OPTIONS = [{ id: 'LESS_THAN_2', label: '< 2 anos' }, { id: '2_TO_5', label: '2 a 5 anos' }, { id: '6_TO_10', label: '6 a 10 anos' }, { id: 'MORE_THAN_10', label: '> 10 anos' }];
const FREQ_OPTIONS = [{ id: 'RARELY', label: 'Raramente' }, { id: '1_TO_2', label: '1 a 2 vezes' }, { id: '3_OR_MORE', label: '3+ vezes' }];

export const AssessmentFormView = () => {
  const { control, onSubmit, errors, isSubmitting, dynamicOverall } = useAssessmentLogic();

  return (
    <ScrollView className="flex-1 bg-neutral-50 p-4" showsVerticalScrollIndicator={false}>
      <View className="mb-6 items-center bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
        <Text className="text-neutral-500 font-medium mb-1">Seu Overall Estimado</Text>
        <Text className="text-5xl font-black text-emerald-600">{dynamicOverall}</Text>
        <Text className="text-xs text-neutral-400 mt-2 text-center">
          Varia dinamicamente conforme sua posição, histórico e atributos.
        </Text>
      </View>

      <View className="mb-6">
        <Text className="text-lg font-bold text-neutral-800 mb-4">1. Histórico e Posição</Text>
        
        <Text className="text-sm font-bold text-neutral-700 mb-2">Nível mais alto que já competiu</Text>
        <Controller
          control={control}
          name="highestLevel"
          render={({ field: { onChange, value } }) => (
            <View className="flex-row flex-wrap gap-2 mb-4">
              {LEVEL_OPTIONS.map((lvl) => (
                <TouchableOpacity
                  key={lvl.id}
                  onPress={() => onChange(lvl.id)}
                  className={`px-4 py-2 rounded-full border ${value === lvl.id ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-neutral-200'}`}
                >
                  <Text className={value === lvl.id ? 'text-white font-bold text-sm' : 'text-neutral-600 text-sm'}>{lvl.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        />

        <Text className="text-sm font-bold text-neutral-700 mb-2">Há quantos anos joga?</Text>
        <Controller
          control={control}
          name="yearsPlaying"
          render={({ field: { onChange, value } }) => (
            <View className="flex-row flex-wrap gap-2 mb-4">
              {YEARS_OPTIONS.map((yr) => (
                <TouchableOpacity
                  key={yr.id}
                  onPress={() => onChange(yr.id)}
                  className={`px-4 py-2 rounded-full border ${value === yr.id ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-neutral-200'}`}
                >
                  <Text className={value === yr.id ? 'text-white font-bold text-sm' : 'text-neutral-600 text-sm'}>{yr.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        />

        <Text className="text-sm font-bold text-neutral-700 mb-2">Frequência Semanal</Text>
        <Controller
          control={control}
          name="weeklyFrequency"
          render={({ field: { onChange, value } }) => (
            <View className="flex-row flex-wrap gap-2 mb-4">
              {FREQ_OPTIONS.map((freq) => (
                <TouchableOpacity
                  key={freq.id}
                  onPress={() => onChange(freq.id)}
                  className={`px-4 py-2 rounded-full border ${value === freq.id ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-neutral-200'}`}
                >
                  <Text className={value === freq.id ? 'text-white font-bold text-sm' : 'text-neutral-600 text-sm'}>{freq.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        />

        <Text className="text-sm font-bold text-neutral-700 mb-2">Posição Preferida</Text>
        <Controller
          control={control}
          name="preferredPosition"
          render={({ field: { onChange, value } }) => (
            <View className="flex-row flex-wrap gap-2 mb-4">
              {['Goalkeeper', 'Defender', 'Midfielder', 'Forward'].map((pos) => (
                <TouchableOpacity
                  key={pos}
                  onPress={() => onChange(pos)}
                  className={`px-4 py-2 rounded-full border ${
                    value === pos ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-neutral-200'
                  }`}
                >
                  <Text className={value === pos ? 'text-white font-bold' : 'text-neutral-600'}>
                    {pos}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        />
      </View>

      <View className="mb-8">
        <Text className="text-lg font-bold text-neutral-800 mb-4">2. Autoavaliação (0-100)</Text>
        <View className="flex-row flex-wrap justify-between">
          {STAT_FIELDS.map(({ key, label }) => (
            <Controller
              key={key}
              control={control}
              name={key}
              render={({ field: { onChange, value } }) => (
                <View className="w-[48%] mb-4">
                  <Text className="text-sm text-neutral-600 font-medium mb-1">{label}</Text>
                  <TextInput
                    className="bg-white border border-neutral-200 rounded-xl px-4 py-3 text-neutral-800 font-semibold"
                    keyboardType="numeric"
                    maxLength={3}
                    value={String(value)}
                    onChangeText={(val) => onChange(Number(val.replace(/[^0-9]/g, '')))}
                  />
                  {errors[key] && (
                    <Text className="text-red-500 text-xs mt-1">{errors[key]?.message as string}</Text>
                  )}
                </View>
              )}
            />
          ))}
        </View>
      </View>

      <TouchableOpacity
        onPress={onSubmit}
        disabled={isSubmitting}
        className={`bg-emerald-600 py-4 rounded-xl items-center mb-10 ${isSubmitting ? 'opacity-70' : ''}`}
      >
        {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-lg">Finalizar Avaliação</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
};