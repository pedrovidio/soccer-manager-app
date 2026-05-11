import { z } from 'zod';

// Tipagem e Schema espelhado do SubmitAssessmentRequestDTO (Backend)

const statAttribute = z
  .number({ invalid_type_error: 'O valor deve ser um número.' })
  .min(0, 'O valor mínimo é 0.')
  .max(100, 'O valor máximo é 100.');

export const assessmentSchema = z.object({
  // Seção 1 — Histórico no Futebol
  highestLevel: z.enum(['PROFESSIONAL', 'AMATEUR', 'CASUAL'], {
    errorMap: () => ({ message: 'Selecione o nível mais alto em que você já competiu.' }),
  }),

  yearsPlaying: z.enum(['LESS_THAN_2', '2_TO_5', '6_TO_10', 'MORE_THAN_10'], {
    errorMap: () => ({ message: 'Selecione há quantos anos você joga futebol regularmente.' }),
  }),

  weeklyFrequency: z.enum(['RARELY', '1_TO_2', '3_OR_MORE'], {
    errorMap: () => ({ message: 'Selecione com que frequência você joga por semana.' }),
  }),

  // Seção 2 — Autoavaliação dos Atributos Técnicos (0–100)
  selfRatedPace: statAttribute,
  selfRatedShooting: statAttribute,
  selfRatedPassing: statAttribute,
  selfRatedDribbling: statAttribute,
  selfRatedDefense: statAttribute,
  selfRatedPhysical: statAttribute,

  // Seção 3 — Posição
  preferredPosition: z.enum(['Goalkeeper', 'Defender', 'Midfielder', 'Forward'], {
    errorMap: () => ({ message: 'Selecione sua posição preferida.' }),
  }),
});

export type AssessmentFormData = z.infer<typeof assessmentSchema>;