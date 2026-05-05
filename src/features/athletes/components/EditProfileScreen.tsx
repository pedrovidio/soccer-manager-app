import React from 'react';
import {
  View, Text, TouchableOpacity, SafeAreaView,
  ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Radius, Spacing } from '../../common/theme';
import { useEditProfileForm } from '../hooks/useEditProfileForm';
import StepCadastro from './StepCadastro';
import StepQuestionario from './StepQuestionario';
import StepDisponibilidade from './StepDisponibilidade';

const STEPS = ['Cadastro', 'Questionário', 'Avulso'];

export default function EditProfileScreen() {
  const router = useRouter();
  const form = useEditProfileForm();
  const { step, setStep, saveAndNext, isPending } = form;

  const isLastStep = step === 2;

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => (step > 0 ? setStep((step - 1) as 0 | 1 | 2) : router.back())}>
            <Ionicons name="arrow-back" size={20} color={Colors.n900} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Editar perfil</Text>
          <TouchableOpacity
            style={[s.nextBtn, isPending && s.nextBtnDisabled]}
            onPress={saveAndNext}
            disabled={isPending}
          >
            {isPending
              ? <ActivityIndicator size="small" color={Colors.white} />
              : <Text style={s.nextBtnText}>{isLastStep ? 'Salvar' : 'Próximo'}</Text>
            }
          </TouchableOpacity>
        </View>

        {/* Stepper */}
        <View style={s.stepper}>
          {STEPS.map((label, i) => (
            <React.Fragment key={i}>
              <View style={s.stepItem}>
                <View style={[s.stepDot, i <= step && s.stepDotActive, i < step && s.stepDotDone]}>
                  {i < step
                    ? <Ionicons name="checkmark" size={12} color={Colors.white} />
                    : <Text style={[s.stepNum, i <= step && s.stepNumActive]}>{i + 1}</Text>
                  }
                </View>
                <Text style={[s.stepLabel, i === step && s.stepLabelActive]}>{label}</Text>
              </View>
              {i < STEPS.length - 1 && (
                <View style={[s.stepLine, i < step && s.stepLineActive]} />
              )}
            </React.Fragment>
          ))}
        </View>

        {/* Step content */}
        {step === 0 && <StepCadastro {...form} />}
        {step === 1 && (
          <StepQuestionario
            highestLevel={form.highestLevel} setHighestLevel={form.setHighestLevel}
            yearsPlaying={form.yearsPlaying} setYearsPlaying={form.setYearsPlaying}
            weeklyFrequency={form.weeklyFrequency} setWeeklyFrequency={form.setWeeklyFrequency}
            pace={form.pace} setPace={form.setPace}
            shooting={form.shooting} setShooting={form.setShooting}
            passing={form.passing} setPassing={form.setPassing}
            dribbling={form.dribbling} setDribbling={form.setDribbling}
            defense={form.defense} setDefense={form.setDefense}
            physical={form.physical} setPhysical={form.setPhysical}
          />
        )}
        {step === 2 && <StepDisponibilidade {...form} />}

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:             { flex: 1, backgroundColor: Colors.n50 },
  header:           { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.white, borderBottomWidth: 0.5, borderBottomColor: Colors.n200, gap: 12 },
  backBtn:          { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.n100, alignItems: 'center', justifyContent: 'center' },
  headerTitle:      { flex: 1, fontSize: 16, fontWeight: '700', color: Colors.n900 },
  nextBtn:          { backgroundColor: Colors.primary, borderRadius: Radius.r8, paddingHorizontal: 16, paddingVertical: 8, minWidth: 72, alignItems: 'center' },
  nextBtnDisabled:  { opacity: 0.6 },
  nextBtnText:      { color: Colors.white, fontSize: 13, fontWeight: '700' },

  stepper:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.white, borderBottomWidth: 0.5, borderBottomColor: Colors.n200 },
  stepItem:         { alignItems: 'center', gap: 4 },
  stepDot:          { width: 26, height: 26, borderRadius: 13, backgroundColor: Colors.n200, alignItems: 'center', justifyContent: 'center' },
  stepDotActive:    { backgroundColor: Colors.primary },
  stepDotDone:      { backgroundColor: Colors.success },
  stepNum:          { fontSize: 12, fontWeight: '700', color: Colors.n500 },
  stepNumActive:    { color: Colors.white },
  stepLabel:        { fontSize: 10, fontWeight: '500', color: Colors.n400 },
  stepLabelActive:  { color: Colors.primary, fontWeight: '700' },
  stepLine:         { flex: 1, height: 2, backgroundColor: Colors.n200, marginBottom: 14 },
  stepLineActive:   { backgroundColor: Colors.success },
});
