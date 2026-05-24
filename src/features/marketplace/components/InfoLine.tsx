import React, { memo } from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@ui/tokens/theme';
import { styles } from './styles';

type InfoLineProps = {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
};

function InfoLineComponent({ icon, text }: InfoLineProps) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={15} color={Colors.n500} />
      <Text style={styles.infoLineText}>{text}</Text>
    </View>
  );
}

export const InfoLine = memo(InfoLineComponent);
