import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius } from '../../theme';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg';
type AvatarColor = 'blue' | 'green' | 'amber';

interface AvatarProps {
  initials: string;
  size?: AvatarSize;
  color?: AvatarColor;
}

const sizeMap = { xs: 24, sm: 32, md: 40, lg: 56 };
const fontMap = { xs: 9, sm: 11, md: 14, lg: 20 };
const colorMap = {
  blue: { bg: Colors.primaryLight, text: Colors.primaryDark },
  green: { bg: Colors.successLight, text: Colors.successDark },
  amber: { bg: Colors.warningLight, text: Colors.warningDark },
};

export function Avatar({ initials, size = 'md', color = 'blue' }: AvatarProps) {
  const dim = sizeMap[size];
  const { bg, text } = colorMap[color];
  return (
    <View style={[styles.base, { width: dim, height: dim, backgroundColor: bg }]}>
      <Text style={[styles.text, { fontSize: fontMap[size], color: text }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: Radius.r999, alignItems: 'center', justifyContent: 'center' },
  text: { fontWeight: '700' },
});
