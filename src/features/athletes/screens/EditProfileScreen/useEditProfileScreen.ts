import { useCallback, useRef } from 'react';
import { Keyboard, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useEditProfileForm } from '@features/athletes/hooks/useEditProfileForm';

const TOTAL_STEPS = 3;

export function useEditProfileScreen() {
  const router = useRouter();
  const form = useEditProfileForm();
  const scrollRef = useRef<ScrollView>(null);

  const handleNext = useCallback(() => {
    Keyboard.dismiss();
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    form.saveAndNext();
  }, [form]);

  const handleBack = useCallback(() => {
    if (form.step > 0) {
      form.setStep((form.step - 1) as 0 | 1 | 2);
      return;
    }
    router.back();
  }, [form, router]);

  return {
    form,
    handleBack,
    handleNext,
    scrollRef,
    totalSteps: TOTAL_STEPS,
  };
}
