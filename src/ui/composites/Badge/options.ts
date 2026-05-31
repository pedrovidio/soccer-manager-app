import { Arena } from '@ui/tokens/theme';

export type BadgeVariant = 'ok' | 'warn' | 'err' | 'inf' | 'neutral' | 'gold' | 'silver';

export const BADGE_VARIANT: Record<BadgeVariant, { bg: string; text: string }> = {
  get ok() { return { bg: Arena.successBg, text: Arena.success }; },
  get warn() { return { bg: Arena.warningBg, text: Arena.warning }; },
  get err() { return { bg: Arena.errorBg, text: Arena.error }; },
  get inf() { return { bg: Arena.neonSoft, text: Arena.neon }; },
  get neutral() { return { bg: Arena.cardSoft, text: Arena.textMuted }; },
  get gold() { return { bg: 'rgba(245, 158, 11, 0.20)', text: '#F59E0B' }; },
  get silver() { return { bg: 'rgba(156, 163, 175, 0.20)', text: '#9CA3AF' }; },
};
