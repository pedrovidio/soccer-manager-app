import React, { memo, useMemo } from 'react';
import { View, Text } from 'react-native';
import { getOverallColor } from './overallBadgeUtils';
import { styles } from './styles';

interface OverallBadgeProps {
  value: number;
}

function OverallBadgeComponent({ value }: OverallBadgeProps) {
  const containerStyle = useMemo(() => ({ backgroundColor: getOverallColor(value) }), [value]);

  return (
    <View style={[styles.base, containerStyle]}>
      <Text style={styles.num}>{value}</Text>
      <Text style={styles.lbl}>OVR</Text>
    </View>
  );
}

export const OverallBadge = memo(OverallBadgeComponent);
