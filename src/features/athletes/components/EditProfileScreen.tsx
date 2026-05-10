import React, { useRef } from 'react';
import {
  View, Text, TouchableOpacity, SafeAreaView, ScrollView,
  ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, Keyboard, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Radius, Spacing } from '../../common/theme';
import { useEditProfileForm } from '../hooks/useEditProfileForm';
import StepCadastro from './StepCadastro';
import StepQuestionario from './StepQuestionario';
import StepDisponibilidade from './StepDisponibilidade';
import { WizardHeader } from '../../common/components/form/FormElements';

const TOTAL_STEPS = 3;

export default function EditProfileScreen() {
  const router = useRouter();
  const form = useEditProfileForm();
  const { step, setStep, saveAndNext, isPending } = form;
  const scrollRef = useRef<ScrollView>(null);

  function handleNext() {
    Keyboard.dismiss();
    if (step < TOTAL_STEPS - 1) {
      setStep((step + 1) as 0 | 1 | 2);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    } else {
      saveAndNext();
    }
  }

  function handleBack() {
    if (step > 0) {
      setStep((step - 1) as 0 | 1 | 2);
    } else {
      router.back();
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        {/* Header unificado */}
        <WizardHeader
          step={step + 1}
          totalSteps={TOTAL_STEPS}
          onBack={handleBack}
        />

        {/* ScrollView com conteúdo */}
        <ScrollView 
          ref={scrollRef} 
          contentContainerStyle={s.scroll} 
          showsVerticalScrollIndicator={false} 
          keyboardShouldPersistTaps="handled"
        >
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

          {/* Botão de ação */}
          <TouchableOpacity
            style={[s.btn, isPending ? s.btnDisabled : null]}
            onPress={handleNext}
            disabled={isPending}
          >
            {isPending
              ? <ActivityIndicator color={Colors.white} />
              : <Text style={s.btnText}>{step < TOTAL_STEPS - 1 ? 'Continuar' : 'Salvar'}</Text>
            }
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:             { flex: 1, backgroundColor: Colors.n50 },
  scroll:           { padding: Spacing.lg, paddingBottom: 40 },
  btn:              { backgroundColor: Colors.primary, borderRadius: Radius.r12, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  btnDisabled:      { opacity: 0.7 },
  btnText:          { color: Colors.white, fontSize: 15, fontWeight: '700' },
});
