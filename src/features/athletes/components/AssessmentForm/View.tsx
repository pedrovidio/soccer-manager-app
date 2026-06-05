import React from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useAssessmentLogic } from '@features/athletes/hooks/useAssessmentLogic';
import { AssessmentFormData } from '@features/athletes/schemas/assessmentSchema';
import { FREQ_OPTIONS, LEVEL_OPTIONS, POSITION_OPTIONS, YEARS_OPTIONS } from './options';
import { OptionGroup } from './OptionGroup';
import { OverallCard } from './OverallCard';
import { StatsGrid } from './StatsGrid';
import { styles } from './styles';
import { Arena } from '@ui/tokens/theme';

export const AssessmentFormView = () => {
  const { control, onSubmit, errors, isSubmitting, dynamicOverall } = useAssessmentLogic();

  return (
    <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
      <OverallCard overall={dynamicOverall} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Historico e Posicao</Text>
        <OptionGroup<AssessmentFormData> control={control} name="highestLevel" options={LEVEL_OPTIONS} title="Nivel mais alto que ja competiu" />
        <OptionGroup<AssessmentFormData> control={control} name="yearsPlaying" options={YEARS_OPTIONS} title="Ha quantos anos joga?" />
        <OptionGroup<AssessmentFormData> control={control} name="weeklyFrequency" options={FREQ_OPTIONS} title="Frequencia semanal" />
        <OptionGroup<AssessmentFormData> control={control} name="preferredPosition" options={POSITION_OPTIONS} title="Posicao Preferida" />
      </View>

      <View style={styles.sectionLast}>
        <Text style={styles.sectionTitle}>2. Autoavaliacao (0-100)</Text>
        <StatsGrid control={control} errors={errors} />
      </View>

      <TouchableOpacity
        onPress={onSubmit}
        disabled={isSubmitting}
        style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
      >
        {isSubmitting ? <ActivityIndicator color={Arena.buttonLabelPrimary} /> : <Text style={styles.submitText}>Finalizar Avaliacao</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
};
