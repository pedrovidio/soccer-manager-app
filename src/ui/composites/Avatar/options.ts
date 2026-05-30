import { Arena } from '@ui/tokens/theme';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg';
export type AvatarColor = 'blue' | 'green' | 'amber';

export const AVATAR_SIZE: Record<AvatarSize, number> = { xs: 24, sm: 32, md: 40, lg: 56 };
export const AVATAR_FONT_SIZE: Record<AvatarSize, number> = { xs: 9, sm: 11, md: 14, lg: 20 };

export const AVATAR_COLOR: Record<AvatarColor, { bg: string; text: string }> = {
  blue: { bg: Arena.neonSoft, text: Arena.neon },
  green: { bg: 'rgba(34, 197, 94, 0.16)', text: '#4ADE80' },
  amber: { bg: 'rgba(245, 158, 11, 0.16)', text: '#FBBF24' },
};
