import type { FootballLevel, WeeklyFrequency, YearsPlaying } from '../../../auth/registerTypes';

export const LEVELS: { value: FootballLevel; label: string; desc: string; icon: string }[] = [
  { value: 'PROFESSIONAL', label: 'Profissional', desc: 'Jogou em clube ou competicao oficial', icon: '🏆' },
  { value: 'AMATEUR', label: 'Amador', desc: 'Joga em varzea ou campeonatos locais', icon: '⚽' },
  { value: 'CASUAL', label: 'Casual', desc: 'Joga por lazer e diversao', icon: '🎮' },
];

export const YEARS: { value: YearsPlaying; label: string }[] = [
  { value: 'LESS_THAN_2', label: '< 2 anos' },
  { value: '2_TO_5', label: '2 a 5 anos' },
  { value: '6_TO_10', label: '6 a 10 anos' },
  { value: 'MORE_THAN_10', label: '+ de 10 anos' },
];

export const FREQUENCY: { value: WeeklyFrequency; label: string }[] = [
  { value: 'RARELY', label: 'Raramente' },
  { value: '1_TO_2', label: '1 a 2x/semana' },
  { value: '3_OR_MORE', label: '3x ou mais' },
];

export const ATTRIBUTES = [
  { key: 'pace', label: 'Velocidade', setter: 'setPace' },
  { key: 'shooting', label: 'Finalizacao', setter: 'setShooting' },
  { key: 'passing', label: 'Passe', setter: 'setPassing' },
  { key: 'dribbling', label: 'Drible', setter: 'setDribbling' },
  { key: 'defense', label: 'Defesa', setter: 'setDefense' },
  { key: 'physical', label: 'Fisico', setter: 'setPhysical' },
] as const;
