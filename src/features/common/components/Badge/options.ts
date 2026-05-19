import { Colors } from '../../theme';

export type BadgeVariant = 'ok' | 'warn' | 'err' | 'inf' | 'neutral' | 'gold' | 'silver';

export const BADGE_VARIANT: Record<BadgeVariant, { bg: string; text: string }> = {
  ok: { bg: Colors.successLight, text: Colors.successDark },
  warn: { bg: Colors.warningLight, text: Colors.warningDark },
  err: { bg: Colors.errorLight, text: Colors.errorDark },
  inf: { bg: Colors.primaryLight, text: Colors.primaryDark },
  neutral: { bg: Colors.n100, text: Colors.n700 },
  gold: { bg: '#FEF3C7', text: '#92400E' },
  silver: { bg: Colors.n100, text: Colors.n700 },
};
