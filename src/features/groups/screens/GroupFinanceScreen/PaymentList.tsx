import React, { memo, useCallback } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { GroupFinancePayment } from '@features/groups/groupTypes';
import { EmptyState } from './EmptyState';
import { PaymentRow } from './PaymentRow';
import { styles } from './styles';

type Props = {
  title: string;
  empty: string;
  payments: GroupFinancePayment[];
  confirmingId?: string;
  onConfirm: (payment: GroupFinancePayment) => void;
  canLoadMore?: boolean;
  onLoadMore?: () => void;
  total?: number;
};

function PaymentListComponent({ title, empty, payments, confirmingId, onConfirm, canLoadMore = false, onLoadMore, total }: Props) {
  const renderPayment = useCallback(({ item }: { item: GroupFinancePayment }) => (
    <PaymentRow payment={item} onConfirm={onConfirm} isConfirming={confirmingId === item.id} />
  ), [confirmingId, onConfirm]);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {total !== undefined && total > payments.length && (
        <Text style={styles.listMeta}>{payments.length} de {total} itens</Text>
      )}
      <FlatList
        data={payments}
        keyExtractor={(item) => item.id}
        renderItem={renderPayment}
        scrollEnabled={false}
        ItemSeparatorComponent={ListSeparator}
        ListEmptyComponent={<EmptyState text={empty} />}
        removeClippedSubviews={false}
      />
      {canLoadMore && onLoadMore && (
        <TouchableOpacity style={styles.loadMoreBtn} onPress={onLoadMore} activeOpacity={0.75}>
          <Text style={styles.loadMoreText}>Carregar mais</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export const PaymentList = memo(PaymentListComponent);

function ListSeparator() {
  return <View style={styles.listSeparator} />;
}
