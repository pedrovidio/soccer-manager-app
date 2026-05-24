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

type ViaCepResponse = {
  erro?: boolean;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
};

export function useRegisterScreen() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<RegisterFormData>(INITIAL_REGISTER_FORM);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const { setAssessmentCompleted } = useAuthStore();

  const setField = useCallback((field: keyof RegisterFormData, value: RegisterFormData[keyof RegisterFormData]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const resolveCep = useCallback(async (cepDigits: string) => {
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`);
      const data = (await res.json()) as ViaCepResponse;
      if (data.erro) return;

      setForm((prev) => ({
        ...prev,
        street: data.logradouro ?? '',
        neighborhood: data.bairro ?? '',
        city: data.localidade ?? '',
        state: data.uf ?? '',
      }));
    } catch {
      Alert.alert('Erro', 'Não foi possível buscar o CEP.');
    }
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

      const registerPayload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        cpf: form.cpf.replace(/\D/g, ''),
        phone: form.phone.replace(/\D/g, ''),
        age: Number(form.age),
        gender: form.gender as Gender,
        address: {
          cep: form.cep.trim(),
          street: form.street.trim(),
          number: Number(form.number),
          complement: form.complement.trim() || undefined,
          neighborhood: form.neighborhood.trim(),
          city: form.city.trim(),
          state: form.state.trim().toUpperCase(),
        },
      };

      const athlete = await registerApi.register(registerPayload);

      await registerApi.submitAssessment(athlete.id, {
        playedProfessionally: form.playedProfessionally,
        highestLevel: form.highestLevel as FootballLevel,
        yearsPlaying: form.yearsPlaying as YearsPlaying,
        weeklyFrequency: form.weeklyFrequency as WeeklyFrequency,
        selfRatedPace: form.selfRatedPace,
        selfRatedShooting: form.selfRatedShooting,
        selfRatedPassing: form.selfRatedPassing,
        selfRatedDribbling: form.selfRatedDribbling,
        selfRatedDefense: form.selfRatedDefense,
        selfRatedPhysical: form.selfRatedPhysical,
        preferredPosition: form.preferredPosition,
      });

      if (form.wantsAvailability && form.availabilitySlots.length > 0) {
        await registerApi.saveAvailability(athlete.id, form.availabilitySlots);
      }

      setAssessmentCompleted();
      setMemoryToken(authSession.token);
      await Promise.all([
        SecureStore.setItemAsync('athlete_id', athlete.id),
        SecureStore.setItemAsync('athlete_name', authSession.name),
        SecureStore.setItemAsync('has_assessment', 'true'),
      ]);
      useAuthStore.setState({
        token: authSession.token,
        athleteId: athlete.id,
        name: authSession.name,
        isAuthenticated: true,
      });
      router.replace('/');
    } catch (error: any) {
      Alert.alert('Erro', parseApiError(error));
    } finally {
      setLoading(false);
    }
  }, [form, router, setAssessmentCompleted]);

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
    resolveCep,
    step,
    totalSteps: TOTAL_STEPS,
    goBack,
    handlePrimaryAction,
  };
}
