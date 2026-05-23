import React, { memo, useMemo } from 'react';
import { Text, View } from 'react-native';
import { Colors } from '../../../../ui/tokens/theme';
import { styles } from './styles';

type Props = {
  label: string;
  tone: 'warning' | 'error' | 'neutral';
};

function StatusTagComponent({ label, tone }: Props) {
  const colors = useMemo(() => ({
    backgroundColor: tone === 'warning' ? Colors.warningLight : tone === 'error' ? Colors.errorLight : Colors.n200,
    color: tone === 'warning' ? Colors.warningDark : tone === 'error' ? Colors.errorDark : Colors.n700,
  }), [tone]);

  return (
    <View style={[styles.statusTag, { backgroundColor: colors.backgroundColor }]}>
      <Text style={[styles.statusTagText, { color: colors.color }]}>{label}</Text>
    </View>
  );
}

export const StatusTag = memo(StatusTagComponent);
