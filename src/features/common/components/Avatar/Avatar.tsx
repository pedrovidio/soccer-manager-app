import React, { memo, useMemo } from 'react';
import { View, Text } from 'react-native';
import { AVATAR_COLOR, AVATAR_FONT_SIZE, AVATAR_SIZE, AvatarColor, AvatarSize } from './options';
import { styles } from './styles';

interface AvatarProps {
  initials: string;
  size?: AvatarSize;
  color?: AvatarColor;
}

function AvatarComponent({ initials, size = 'md', color = 'blue' }: AvatarProps) {
  const dim = AVATAR_SIZE[size];
  const { bg, text } = AVATAR_COLOR[color];
  const containerStyle = useMemo(() => ({ width: dim, height: dim, backgroundColor: bg }), [bg, dim]);
  const textStyle = useMemo(() => ({ fontSize: AVATAR_FONT_SIZE[size], color: text }), [size, text]);

  return (
    <View style={[styles.base, containerStyle]}>
      <Text style={[styles.text, textStyle]}>{initials}</Text>
    </View>
  );
}

export const Avatar = memo(AvatarComponent);
