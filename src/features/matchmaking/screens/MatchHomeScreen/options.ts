import { Gender, PresenceStatus } from '@features/matchmaking/types';

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'ANY', label: 'Qualquer' },
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Feminino' },
];

export const PRESENCE_FILTER_LABEL: Record<PresenceStatus, string> = {
  CONFIRMED: 'Confirmados',
  WAITLISTED: 'Na fila de espera',
  DECLINED: 'Recusaram',
  PENDING: 'Pendentes',
};

export function teamNameFallback(teamNumber: number) {
  return `Time ${teamNumber}`;
}
