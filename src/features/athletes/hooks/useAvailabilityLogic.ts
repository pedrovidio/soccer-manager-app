import { useCallback } from 'react';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@lib/queryKeys';
import { useAuthStore } from '@features/auth/useAuthStore';
import { athleteApi } from '../services/athleteApi';
import { availabilitySchema, AvailabilityFormData } from '../schemas/availabilitySchema';

export const useAvailabilityLogic = () => {
  const qc = useQueryClient();
  const athleteId = useAuthStore((s) => s.athleteId) ?? '';
  const { control, handleSubmit, formState: { errors } } = useForm<AvailabilityFormData>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: {
      availabilities: [{ dayOfWeek: 1, startTime: '18:00', endTime: '20:00' }],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'availabilities',
  });

  const mutation = useMutation({
    mutationFn: (data: AvailabilityFormData) => athleteApi.saveAvailability(athleteId, data.availabilities),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.availability(athleteId) });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Sucesso!', 'Sua agenda foi configurada.');
    },
    onError: (error: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erro', error?.response?.data?.error ?? 'Nao foi possivel salvar sua agenda.');
    },
  });

  const onSubmit = useCallback(async (data: AvailabilityFormData) => {
    if (!athleteId) {
      Alert.alert('Erro', 'Faca login novamente para salvar sua agenda.');
      return;
    }
    await mutation.mutateAsync(data);
  }, [athleteId, mutation]);

  return {
    control,
    fields,
    append,
    remove,
    update,
    onSubmit: handleSubmit(onSubmit),
    errors,
    isPending: mutation.isPending,
  };
};
