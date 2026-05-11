import { z } from 'zod';

export const availabilitySchema = z.object({
  availabilities: z.array(
    z.object({
      dayOfWeek: z.number().min(0).max(6),
      startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Hora inválida'),
      endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Hora inválida'),
    })
  ).min(1, 'Adicione pelo menos um dia e horário de disponibilidade.'),
});

export type AvailabilityFormData = z.infer<typeof availabilitySchema>;