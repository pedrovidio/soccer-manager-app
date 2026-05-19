import { Colors } from '../../../common/theme';

export const ATTRS = [
  { key: 'pace', label: 'Velocidade' },
  { key: 'shooting', label: 'Finalizacao' },
  { key: 'passing', label: 'Passe' },
  { key: 'dribbling', label: 'Drible' },
  { key: 'defense', label: 'Defesa' },
  { key: 'physical', label: 'Fisico' },
] as const;

export const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  Ativo: { bg: Colors.successLight, color: Colors.successDark },
  Lesionado: { bg: Colors.warningLight, color: Colors.warningDark },
  Inadimplente: { bg: Colors.errorLight, color: Colors.errorDark },
};

export function overallColor(overall: number) {
  return overall >= 70 ? Colors.success : overall >= 50 ? Colors.warning : Colors.error;
}
