import { z } from 'zod';

const statAttribute = z
  .number({ error: 'O valor deve ser um número.' })
  .min(0, 'O valor mínimo é 0.')
  .max(100, 'O valor máximo é 100.');

export const assessmentSchema = z.object({
  highestLevel: z.enum(['PROFESSIONAL', 'AMATEUR', 'CASUAL'], {
    error: 'Selecione o nível mais alto em que você já competiu.',
  }),

  yearsPlaying: z.enum(['LESS_THAN_2', '2_TO_5', '6_TO_10', 'MORE_THAN_10'], {
    error: 'Selecione há quantos anos você joga futebol regularmente.',
  }),

  weeklyFrequency: z.enum(['RARELY', '1_TO_2', '3_OR_MORE'], {
    error: 'Selecione com que frequência você joga por semana.',
  }),

  selfRatedPace: statAttribute,
  selfRatedShooting: statAttribute,
  selfRatedPassing: statAttribute,
  selfRatedDribbling: statAttribute,
  selfRatedDefense: statAttribute,
  selfRatedPhysical: statAttribute,

  preferredPosition: z.enum(['Goalkeeper', 'Defender', 'Midfielder', 'Forward'], {
    error: 'Selecione sua posição preferida.',
  }),
});

export type AssessmentFormData = z.infer<typeof assessmentSchema>;
