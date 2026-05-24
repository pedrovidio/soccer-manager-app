import { AssessmentFormData } from '@features/athletes/schemas/assessmentSchema';

export const STAT_FIELDS: Array<{ key: keyof AssessmentFormData; label: string }> = [
  { key: 'selfRatedPace', label: 'Ritmo (Pace)' },
  { key: 'selfRatedShooting', label: 'Chute' },
  { key: 'selfRatedPassing', label: 'Passe' },
  { key: 'selfRatedDribbling', label: 'Drible' },
  { key: 'selfRatedDefense', label: 'Defesa' },
  { key: 'selfRatedPhysical', label: 'Fisico' },
];

export const LEVEL_OPTIONS = [
  { id: 'PROFESSIONAL', label: 'Profissional' },
  { id: 'AMATEUR', label: 'Amador/Varzea' },
  { id: 'CASUAL', label: 'Casual/Recreativo' },
];

export const YEARS_OPTIONS = [
  { id: 'LESS_THAN_2', label: '< 2 anos' },
  { id: '2_TO_5', label: '2 a 5 anos' },
  { id: '6_TO_10', label: '6 a 10 anos' },
  { id: 'MORE_THAN_10', label: '> 10 anos' },
];

export const FREQ_OPTIONS = [
  { id: 'RARELY', label: 'Raramente' },
  { id: '1_TO_2', label: '1 a 2 vezes' },
  { id: '3_OR_MORE', label: '3+ vezes' },
];

export const POSITION_OPTIONS = [
  { id: 'Goalkeeper', label: 'Goalkeeper' },
  { id: 'Defender', label: 'Defender' },
  { id: 'Midfielder', label: 'Midfielder' },
  { id: 'Forward', label: 'Forward' },
];
