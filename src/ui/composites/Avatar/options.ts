import { Colors } from '@ui/tokens/theme';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg';
export type AvatarColor = 'blue' | 'green' | 'amber';

export const AVATAR_SIZE: Record<AvatarSize, number> = { xs: 24, sm: 32, md: 40, lg: 56 };
export const AVATAR_FONT_SIZE: Record<AvatarSize, number> = { xs: 9, sm: 11, md: 14, lg: 20 };

export const AVATAR_COLOR: Record<AvatarColor, { bg: string; text: string }> = {
  blue: { bg: Colors.primaryLight, text: Colors.primaryDark },
  green: { bg: Colors.successLight, text: Colors.successDark },
  amber: { bg: Colors.warningLight, text: Colors.warningDark },
};
