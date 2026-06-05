import { Arena } from '@ui/tokens/theme';

export type BadgeVariant = 'ok' | 'warn' | 'err' | 'inf' | 'neutral' | 'gold' | 'silver';

export const BADGE_VARIANT: Record<BadgeVariant, { bg: string; text: string }> = {
  get ok() { return { bg: Arena.successBg, text: Arena.success }; },
  get warn() { return { bg: Arena.warningBg, text: Arena.warning }; },
  get err() { return { bg: Arena.errorBg, text: Arena.error }; },
  get inf() { return { bg: Arena.neonSoft, text: Arena.neon }; },
  get neutral() { return { bg: Arena.cardSoft, text: Arena.textMuted }; },
  get gold() { return { bg: Arena.warningBg, text: Arena.warning }; },
  get silver() { return { bg: Arena.cardSoft, text: Arena.textMuted }; },
};
