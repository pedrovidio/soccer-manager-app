import React, { memo, useCallback } from 'react';
import { FlatList, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../../ui/tokens/theme';
import { GroupFinanceByType } from '../../groupTypes';
import { formatCurrency, isExpenseType, typeLabel } from '../../utils/financeFormatters';
import { styles } from './styles';

type Props = {
  byType: GroupFinanceByType[];
  overdueCount: number;
  reportedCount: number;
  totalExpenses: number;
  expectedTotal: number;
};

function OverviewSectionComponent({ byType, overdueCount, reportedCount, totalExpenses, expectedTotal }: Props) {
  const renderType = useCallback(({ item }: { item: GroupFinanceByType }) => (
    <View style={styles.rowCard}>
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle}>{typeLabel(item.type)}</Text>
        <Text style={styles.rowSub}>{item.count} lancamento(s)</Text>
      </View>
      <View style={styles.amounts}>
        <Text style={isExpenseType(item.type) ? styles.expenseValue : styles.paidText}>
          {isExpenseType(item.type) ? '-' : ''}{formatCurrency(item.paid)}
        </Text>
        {!isExpenseType(item.type) && <Text style={styles.pendingText}>{formatCurrency(item.pending)} pendente</Text>}
      </View>
    </View>
  ), []);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Movimentacao por tipo</Text>
      <FlatList
        data={byType}
        keyExtractor={(item) => item.type}
        renderItem={renderType}
        scrollEnabled={false}
        ItemSeparatorComponent={ListSeparator}
        removeClippedSubviews={false}
      />
      <Text style={[styles.sectionTitle, styles.sectionTitleSpaced]}>Alertas</Text>
      <AlertLine icon="time-outline" label="Pagamentos vencidos" value={`${overdueCount}`} tone="error" />
      <AlertLine icon="receipt-outline" label="Pagamentos informados aguardando conferencia" value={`${reportedCount}`} tone="warning" />
      <AlertLine icon="trending-down-outline" label="Saidas de caixa registradas" value={formatCurrency(totalExpenses)} tone="error" />
      <AlertLine icon="wallet-outline" label="Total previsto de receitas" value={formatCurrency(expectedTotal)} tone="neutral" />
    </View>
  );
}

function AlertLine({ icon, label, value, tone }: { icon: any; label: string; value: string; tone: 'warning' | 'error' | 'neutral' }) {
  const color = tone === 'warning' ? Colors.warningDark : tone === 'error' ? Colors.errorDark : Colors.n700;
  return (
    <View style={styles.alertLine}>
      <Ionicons name={icon} size={18} color={color} />
      <Text style={styles.alertLabel}>{label}</Text>
      <Text style={[styles.alertValue, { color }]}>{value}</Text>
    </View>
  );
}

export const OverviewSection = memo(OverviewSectionComponent);

function ListSeparator() {
  return <View style={styles.listSeparator} />;
}
