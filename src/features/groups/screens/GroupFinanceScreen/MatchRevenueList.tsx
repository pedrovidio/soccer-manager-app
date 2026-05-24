import React, { memo, useCallback } from 'react';
import { FlatList, Text, View } from 'react-native';
import { GroupFinanceByMatch } from '@features/groups/groupTypes';
import { formatCurrency, formatDate } from '@features/groups/utils/financeFormatters';
import { EmptyState } from './EmptyState';
import { styles } from './styles';

type Props = {
  matches: GroupFinanceByMatch[];
};

function MatchRevenueListComponent({ matches }: Props) {
  const renderMatch = useCallback(({ item }: { item: GroupFinanceByMatch }) => (
    <View style={styles.rowCard}>
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle} numberOfLines={1}>{item.matchLocation}</Text>
        <Text style={styles.rowSub}>{formatDate(item.matchDate)} - {item.transactionCount} cobranca(s)</Text>
      </View>
      <View style={styles.amounts}>
        <Text style={styles.paidText}>{formatCurrency(item.paid)}</Text>
        <Text style={styles.pendingText}>{formatCurrency(item.pending)} pendente</Text>
        {item.overdue > 0 && <Text style={styles.overdueText}>{formatCurrency(item.overdue)} vencido</Text>}
      </View>
    </View>
  ), []);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Arrecadacao por jogo</Text>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.matchId}
        renderItem={renderMatch}
        scrollEnabled={false}
        ItemSeparatorComponent={ListSeparator}
        ListEmptyComponent={<EmptyState text="Nenhuma receita vinculada a partidas" />}
        removeClippedSubviews={false}
      />
    </View>
  );
}

export const MatchRevenueList = memo(MatchRevenueListComponent);

function ListSeparator() {
  return <View style={styles.listSeparator} />;
}
