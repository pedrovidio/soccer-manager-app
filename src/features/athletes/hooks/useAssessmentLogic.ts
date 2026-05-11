import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { Alert } from 'react-native';
import { assessmentSchema, AssessmentFormData } from '../schemas/assessmentSchema';
import { calculateWeightedOverall } from '../../../utils/overallCalculator';
import { httpClient as api } from '../../../lib/httpClient';

export const useAssessmentLogic = () => {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AssessmentFormData>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      highestLevel: 'CASUAL',
      yearsPlaying: 'LESS_THAN_2',
      weeklyFrequency: 'RARELY',
      selfRatedPace: 50,
      selfRatedShooting: 50,
      selfRatedPassing: 50,
      selfRatedDribbling: 50,
      selfRatedDefense: 50,
      selfRatedPhysical: 50,
      preferredPosition: 'Midfielder',
    },
  });

  // Observamos apenas os campos necessários para otimizar performance
  const values = watch();

  // Zero Re-renders rule: Calculamos dinamicamente usando memoização
  const dynamicOverall = useMemo(() => {
    return calculateWeightedOverall(
      {
        pace: values.selfRatedPace,
        shooting: values.selfRatedShooting,
        passing: values.selfRatedPassing,
        dribbling: values.selfRatedDribbling,
        defense: values.selfRatedDefense,
        physical: values.selfRatedPhysical,
      },
      values.highestLevel,
      values.preferredPosition
    );
  }, [values]);

  // Mutation do React Query gerenciando o estado do servidor e os Side Effects
  const { mutateAsync: submitAssessment, isPending } = useMutation({
    mutationFn: async (data: AssessmentFormData) => {
      const response = await api.post('/assessment', data);
      return response.data;
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Sucesso!', 'Seu Overall inicial foi calculado e salvo.');
      // TODO: Redirecionar para o Dashboard ou atualizar Store do Zustand (Ex: setAssessmentCompleted)
    },
    onError: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Ops!', 'Não foi possível enviar sua avaliação. Verifique a conexão e tente novamente.');
    },
  });

  const onSubmit = useCallback(async (data: AssessmentFormData) => {
    await submitAssessment(data);
  }, [submitAssessment]);

  return { control, onSubmit: handleSubmit(onSubmit), errors, isSubmitting: isPending, dynamicOverall };
};