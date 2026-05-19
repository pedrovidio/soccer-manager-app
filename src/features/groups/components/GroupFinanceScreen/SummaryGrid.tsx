import React, { memo } from 'react';
import { View } from 'react-native';
import { GroupFinanceReport } from '../../groupTypes';
import { formatCurrency } from '../../utils/financeFormatters';
import { MetricCard } from './MetricCard';
import { styles } from './styles';

type Props = {
  summary: GroupFinanceReport['summary'];
};

function SummaryGridComponent({ summary }: Props) {
  return (
    <View style={styles.summaryGrid}>
      <MetricCard label="Em caixa" value={formatCurrency(summary.cashInHand)} tone="success" />
      <MetricCard label="Despesas" value={formatCurrency(summary.totalExpenses)} tone="error" />
      <MetricCard label="A receber" value={formatCurrency(summary.totalPending)} tone="warning" />
      <MetricCard label="Vencido" value={formatCurrency(summary.totalOverdue)} tone="error" />
    </View>
  );
}

export const SummaryGrid = memo(SummaryGridComponent);
