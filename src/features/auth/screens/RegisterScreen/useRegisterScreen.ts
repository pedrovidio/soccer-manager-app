import { useCallback, useRef, useState } from 'react';
import { Alert, Keyboard, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { setMemoryToken } from '@lib/httpClient';
import {
  FootballLevel,
  Gender,
  RegisterFormData,
  WeeklyFrequency,
  YearsPlaying,
} from '@features/auth/registerTypes';
import { registerApi } from '@features/auth/services/registerApi';
import { useAuthStore } from '@features/auth/useAuthStore';
import { INITIAL_REGISTER_FORM, TOTAL_STEPS } from './options';
import { parseApiError, validatePersonalStep, validateProfileStep } from './registerUtils';



export function useRegisterScreen() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<RegisterFormData>(INITIAL_REGISTER_FORM);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const setField = useCallback((field: keyof RegisterFormData, value: RegisterFormData[keyof RegisterFormData]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const goBack = useCallback(() => {
    if (step > 1) {
      setStep((current) => current - 1);
      return;
    }
    router.back();
  }, [router, step]);

  const handleNext = useCallback(() => {
    const error = step === 1 ? validatePersonalStep(form) : step === 2 ? validateProfileStep(form) : null;
    if (error) {
      Alert.alert('Atenção', error);
      return;
    }

    Keyboard.dismiss();
    setStep((current) => current + 1);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [form, step]);

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    try {
      const authSession = await registerApi.signUp({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        name: form.name.trim(),
      });

      // Parse birthDate DD/MM/AAAA into YYYY-MM-DD
      const dateParts = form.birthDate.split('/');
      const formattedBirthDate = `${dateParts[2]}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`;

      const registerPayload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        birthDate: formattedBirthDate,
        gender: form.gender as Gender,
      };

      const athlete = await registerApi.register(registerPayload);

      setMemoryToken(authSession.token);
      await Promise.all([
        SecureStore.setItemAsync('athlete_id', athlete.id),
        SecureStore.setItemAsync('athlete_name', authSession.name),
        SecureStore.setItemAsync('has_assessment', 'false'),
      ]);
      useAuthStore.setState({
        token: authSession.token,
        athleteId: athlete.id,
        name: authSession.name,
        plan: authSession.plan,
        planExpiresAt: authSession.planExpiresAt,
        hasCompletedAssessment: false,
        isAuthenticated: true,
      });
      router.replace('/');
    } catch (error: any) {
      Alert.alert('Erro', parseApiError(error));
    } finally {
      setLoading(false);
    }
  }, [form, router]);


  const handlePrimaryAction = useCallback(() => {
    if (step < TOTAL_STEPS) {
      handleNext();
      return;
    }

    handleSubmit();
  }, [handleNext, handleSubmit, step]);

  return {
    form,
    loading,
    scrollRef,
    setField,
    step,
    totalSteps: TOTAL_STEPS,
    goBack,
    handlePrimaryAction,
  };
}
