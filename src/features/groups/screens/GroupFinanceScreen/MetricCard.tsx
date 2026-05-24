import React, { memo, useMemo } from 'react';
import { Text, View } from 'react-native';
import { Colors } from '../../../../ui/tokens/theme';
import { Tone } from './types';
import { styles } from './styles';

type Props = {
  label: string;
  value: string;
  tone: Tone;
};

function MetricCardComponent({ label, value, tone }: Props) {
  const colors = useMemo(() => ({
    color: tone === 'success' ? Colors.successDark : tone === 'warning' ? Colors.warningDark : tone === 'error' ? Colors.errorDark : Colors.n900,
    backgroundColor: tone === 'success' ? Colors.successLight : tone === 'warning' ? Colors.warningLight : tone === 'error' ? Colors.errorLight : Colors.white,
  }), [tone]);

  return (
    <View style={[styles.metricCard, { backgroundColor: colors.backgroundColor }]}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, { color: colors.color }]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

export const MetricCard = memo(MetricCardComponent);
