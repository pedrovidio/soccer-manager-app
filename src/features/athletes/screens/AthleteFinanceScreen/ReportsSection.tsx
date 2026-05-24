import React, { memo, useCallback } from 'react';
import { FlatList, Text, View } from 'react-native';
import { AthleteFinanceReport } from '@features/athletes/athleteTypes';
import { formatCurrency, typeLabel } from '@features/athletes/utils/athleteFinanceFormatters';
import { EmptyState } from './EmptyState';
import { styles } from './styles';

type ReportItem = {
  id: string;
  title: string;
  subtitle: string;
  paid: number;
  pending: number;
  overdue: number;
};

function ReportsSectionComponent({ data }: { data: AthleteFinanceReport }) {
  const typeItems: ReportItem[] = data.byType.map((item) => ({
    id: item.type,
    title: typeLabel(item.type),
    subtitle: `${item.count} lancamento(s)`,
    paid: item.paid,
    pending: item.pending,
    overdue: item.overdue,
  }));

  const groupItems: ReportItem[] = data.byGroup.map((item) => ({
    id: item.groupId,
    title: item.groupName,
    subtitle: `${item.count} lancamento(s)`,
    paid: item.paid,
    pending: item.pending,
    overdue: item.overdue,
  }));

  const renderReport = useCallback(({ item }: { item: ReportItem }) => <ReportRow item={item} />, []);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Por tipo</Text>
      <FlatList
        data={typeItems}
        keyExtractor={(item) => item.id}
        renderItem={renderReport}
        scrollEnabled={false}
        ItemSeparatorComponent={ListSeparator}
        removeClippedSubviews={false}
      />
      <Text style={[styles.sectionTitle, styles.sectionTitleSpaced]}>Por grupo</Text>
      <FlatList
        data={groupItems}
        keyExtractor={(item) => item.id}
        renderItem={renderReport}
        scrollEnabled={false}
        ItemSeparatorComponent={ListSeparator}
        ListEmptyComponent={<EmptyState text="Nenhum grupo com lancamentos" />}
        removeClippedSubviews={false}
      />
    </View>
  );
}

function ReportRow({ item }: { item: ReportItem }) {
  return (
    <View style={styles.rowCard}>
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle}>{item.title}</Text>
        <Text style={styles.rowSub}>{item.subtitle}</Text>
      </View>
      <View style={styles.amounts}>
        <Text style={styles.paidText}>{formatCurrency(item.paid)}</Text>
        <Text style={styles.pendingText}>{formatCurrency(item.pending)} pendente</Text>
        {item.overdue > 0 && <Text style={styles.overdueText}>{formatCurrency(item.overdue)} vencido</Text>}
      </View>
    </View>
  );
}

function ListSeparator() {
  return <View style={styles.listSeparator} />;
}

export const ReportsSection = memo(ReportsSectionComponent);
