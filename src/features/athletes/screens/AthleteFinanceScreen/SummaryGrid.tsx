import React, { memo, useMemo } from 'react';
import { Text, View } from 'react-native';
import { Colors } from '@ui/tokens/theme';
import { AthleteFinanceReport } from '@features/athletes/athleteTypes';
import { formatCurrency } from '@features/athletes/utils/athleteFinanceFormatters';
import { styles } from './styles';
import { Tone } from './types';

function MetricCard({ label, value, tone }: { label: string; value: string; tone: Tone }) {
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

function SummaryGridComponent({ summary }: { summary: AthleteFinanceReport['summary'] }) {
  return (
    <View style={styles.summaryGrid}>
      <MetricCard label="Pendente" value={formatCurrency(summary.totalPending)} tone="warning" />
      <MetricCard label="Vencido" value={formatCurrency(summary.totalOverdue)} tone="error" />
      <MetricCard label="Pago" value={formatCurrency(summary.totalPaid)} tone="success" />
      <MetricCard label="Informado" value={formatCurrency(summary.totalReported)} tone="neutral" />
    </View>
  );
}

export const SummaryGrid = memo(SummaryGridComponent);
