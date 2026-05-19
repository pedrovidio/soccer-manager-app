import React from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useAssessmentLogic } from '../../hooks/useAssessmentLogic';
import { AssessmentFormData } from '../../schemas/assessmentSchema';
import { FREQ_OPTIONS, LEVEL_OPTIONS, POSITION_OPTIONS, YEARS_OPTIONS } from './options';
import { OptionGroup } from './OptionGroup';
import { OverallCard } from './OverallCard';
import { StatsGrid } from './StatsGrid';

export const AssessmentFormView = () => {
  const { control, onSubmit, errors, isSubmitting, dynamicOverall } = useAssessmentLogic();

  return (
    <ScrollView className="flex-1 bg-neutral-50 p-4" showsVerticalScrollIndicator={false}>
      <OverallCard overall={dynamicOverall} />

      <View className="mb-6">
        <Text className="text-lg font-bold text-neutral-800 mb-4">1. Historico e Posicao</Text>
        <OptionGroup<AssessmentFormData> control={control} name="highestLevel" options={LEVEL_OPTIONS} title="Nivel mais alto que ja competiu" />
        <OptionGroup<AssessmentFormData> control={control} name="yearsPlaying" options={YEARS_OPTIONS} title="Ha quantos anos joga?" />
        <OptionGroup<AssessmentFormData> control={control} name="weeklyFrequency" options={FREQ_OPTIONS} title="Frequencia semanal" />
        <OptionGroup<AssessmentFormData> control={control} name="preferredPosition" options={POSITION_OPTIONS} title="Posicao Preferida" />
      </View>

      <View className="mb-8">
        <Text className="text-lg font-bold text-neutral-800 mb-4">2. Autoavaliacao (0-100)</Text>
        <StatsGrid control={control} errors={errors} />
      </View>

      <TouchableOpacity
        onPress={onSubmit}
        disabled={isSubmitting}
        className={`bg-emerald-600 py-4 rounded-xl items-center mb-10 ${isSubmitting ? 'opacity-70' : ''}`}
      >
        {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-lg">Finalizar Avaliacao</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
};
