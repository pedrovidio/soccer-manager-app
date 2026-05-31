import { Arena } from '@ui/tokens/theme';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg';
export type AvatarColor = 'blue' | 'green' | 'amber';

export const AVATAR_SIZE: Record<AvatarSize, number> = { xs: 24, sm: 32, md: 40, lg: 56 };
export const AVATAR_FONT_SIZE: Record<AvatarSize, number> = { xs: 9, sm: 11, md: 14, lg: 20 };

export const AVATAR_COLOR: Record<AvatarColor, { bg: string; text: string }> = {
  get blue() { return { bg: Arena.neonSoft, text: Arena.neon }; },
  get green() { return { bg: Arena.successBg, text: Arena.success }; },
  get amber() { return { bg: Arena.warningBg, text: Arena.warning }; },
};
