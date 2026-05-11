import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback } from 'react';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
// import { useMutation } from '@tanstack/react-query'; // Descomente quando integrar com a API
// import { httpClient as api } from '../../../lib/httpClient';

import { availabilitySchema, AvailabilityFormData } from '../schemas/availabilitySchema';

export const useAvailabilityLogic = () => {
  const { control, handleSubmit, formState: { errors } } = useForm<AvailabilityFormData>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: {
      availabilities: [{ dayOfWeek: 1, startTime: '18:00', endTime: '20:00' }], // Começa com um horário padrão
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'availabilities',
  });

  // Mock da mutation para você testar a UI agora
  const isPending = false;
  const onSubmit = useCallback(async (data: AvailabilityFormData) => {
    console.log('Enviando Disponibilidade:', data);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Sucesso!', 'Sua agenda foi configurada.');
  }, []);

  return { 
    control, 
    fields, 
    append, 
    remove, 
    update, 
    onSubmit: handleSubmit(onSubmit), 
    errors, 
    isPending 
  };
};