import React, { memo, useMemo } from 'react';
import { Text, View } from 'react-native';
import { Arena } from '@ui/tokens/theme';
import { Tone } from './types';
import { styles } from './styles';

type Props = {
  label: string;
  value: string;
  tone: Tone;
};

function MetricCardComponent({ label, value, tone }: Props) {
  const colors = useMemo(() => ({
    color: tone === 'success' ? Arena.success : tone === 'warning' ? Arena.warning : tone === 'error' ? Arena.error : Arena.text,
    backgroundColor: tone === 'success' ? Arena.successBg : tone === 'warning' ? Arena.warningBg : tone === 'error' ? Arena.errorBg : Arena.card,
  }), [tone]);

  return (
    <View style={[styles.metricCard, { backgroundColor: colors.backgroundColor }]}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, { color: colors.color }]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

export const MetricCard = memo(MetricCardComponent);
