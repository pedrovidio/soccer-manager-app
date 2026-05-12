import { z } from 'zod';

const statAttribute = z
  .number({ error: 'O valor deve ser um numero.' })
  .min(0, 'O valor minimo e 0.')
  .max(100, 'O valor maximo e 100.');

export const assessmentSchema = z.object({
  highestLevel: z.enum(['PROFESSIONAL', 'AMATEUR', 'CASUAL'], {
    error: 'Selecione o nivel mais alto em que voce ja competiu.',
  }),

  yearsPlaying: z.enum(['LESS_THAN_2', '2_TO_5', '6_TO_10', 'MORE_THAN_10'], {
    error: 'Selecione ha quantos anos voce joga futebol regularmente.',
  }),

  weeklyFrequency: z.enum(['RARELY', '1_TO_2', '3_OR_MORE'], {
    error: 'Selecione com que frequencia voce joga por semana.',
  }),

  selfRatedPace: statAttribute,
  selfRatedShooting: statAttribute,
  selfRatedPassing: statAttribute,
  selfRatedDribbling: statAttribute,
  selfRatedDefense: statAttribute,
  selfRatedPhysical: statAttribute,

  preferredPosition: z.enum(['Goalkeeper', 'Defender', 'Midfielder', 'Forward'], {
    error: 'Selecione sua posicao preferida.',
  }),
});

export type AssessmentFormData = z.infer<typeof assessmentSchema>;
