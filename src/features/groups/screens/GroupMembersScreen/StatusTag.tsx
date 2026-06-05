import React, { memo, useMemo } from 'react';
import { Text, View } from 'react-native';
import { Arena } from '@ui/tokens/theme';
import { styles } from './styles';

type Props = {
  label: string;
  tone: 'warning' | 'error' | 'neutral';
};

function StatusTagComponent({ label, tone }: Props) {
  const colors = useMemo(() => ({
    backgroundColor: tone === 'warning' ? Arena.warningBg : tone === 'error' ? Arena.errorBg : Arena.cardSoft,
    color: tone === 'warning' ? Arena.warning : tone === 'error' ? Arena.error : Arena.textMuted,
  }), [tone]);

  return (
    <View style={[styles.statusTag, { backgroundColor: colors.backgroundColor }]}>
      <Text style={[styles.statusTagText, { color: colors.color }]}>{label}</Text>
    </View>
  );
}

export const StatusTag = memo(StatusTagComponent);
