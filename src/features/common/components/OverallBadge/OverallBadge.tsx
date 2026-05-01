import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius } from '../../theme';

interface OverallBadgeProps {
  value: number;
}

function getColor(v: number) {
  if (v >= 75) return Colors.success;
  if (v >= 55) return Colors.warning;
  return Colors.error;
}

export function OverallBadge({ value }: OverallBadgeProps) {
  return (
    <View style={[styles.base, { backgroundColor: getColor(value) }]}>
      <Text style={styles.num}>{value}</Text>
      <Text style={styles.lbl}>OVR</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: Radius.r999, paddingHorizontal: 10, paddingVertical: 4 },
  num:  { fontSize: 16, fontWeight: '800', color: Colors.white, lineHeight: 18 },
  lbl:  { fontSize: 10, fontWeight: '600', color: Colors.white },
});
