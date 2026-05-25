import { MatchPhase, MatchStatus, MatchType } from '../types';

const MINIMUM_BY_TYPE: Record<MatchType | string, number> = {
  FUTSAL: 10,
  SOCIETY: 14,
  CAMPO: 22,
};

export function minimumConfirmedFor(type: MatchType | string) {
  return MINIMUM_BY_TYPE[type] ?? 0;
}

export function deriveMatchPhase(input: {
  status: MatchStatus | string;
  type: MatchType | string;
  confirmedCount: number;
  isDrafted?: boolean;
}): MatchPhase {
  if (input.status === 'CANCELLED') return 'CANCELLED';
  if (input.status === 'FINISHED') return 'FINISHED';
  if (input.status === 'IN_PROGRESS') return 'IN_PROGRESS';
  if (input.isDrafted) return 'TEAMS_DRAWN';
  if (input.confirmedCount >= minimumConfirmedFor(input.type)) return 'CONFIRMED_WAITING_DRAW';
  return 'WAITING_CONFIRMATION';
}

export function phaseLabel(phase?: MatchPhase | string) {
  switch (phase) {
    case 'WAITING_CONFIRMATION': return 'Aguardando confirmação';
    case 'CONFIRMED_WAITING_DRAW': return 'Jogo confirmado. Aguardando o sorteio.';
    case 'TEAMS_DRAWN': return 'Times sorteados';
    case 'IN_PROGRESS': return 'Em andamento';
    case 'FINISHED': return 'Encerrado';
    case 'CANCELLED': return 'Cancelado';
    default: return 'Aguardando confirmação';
  }
}
