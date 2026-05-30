import { Arena } from '@ui/tokens/theme';

export type BadgeVariant = 'ok' | 'warn' | 'err' | 'inf' | 'neutral' | 'gold' | 'silver';

export const BADGE_VARIANT: Record<BadgeVariant, { bg: string; text: string }> = {
  ok: { bg: 'rgba(34, 197, 94, 0.16)', text: '#4ADE80' },
  warn: { bg: 'rgba(245, 158, 11, 0.16)', text: '#FBBF24' },
  err: { bg: 'rgba(239, 68, 68, 0.16)', text: '#F87171' },
  inf: { bg: Arena.neonSoft, text: Arena.neon },
  neutral: { bg: Arena.cardSoft, text: Arena.textMuted },
  gold: { bg: 'rgba(245, 158, 11, 0.20)', text: '#F59E0B' },
  silver: { bg: 'rgba(156, 163, 175, 0.20)', text: '#9CA3AF' },
};
