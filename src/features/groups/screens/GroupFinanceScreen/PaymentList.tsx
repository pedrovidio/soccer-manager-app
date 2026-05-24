import React, { memo, useCallback } from 'react';
import { FlatList, Text, View } from 'react-native';
import { GroupFinancePayment } from '../../groupTypes';
import { EmptyState } from './EmptyState';
import { PaymentRow } from './PaymentRow';
import { styles } from './styles';

type Props = {
  title: string;
  empty: string;
  payments: GroupFinancePayment[];
  confirmingId?: string;
  onConfirm: (payment: GroupFinancePayment) => void;
};

function PaymentListComponent({ title, empty, payments, confirmingId, onConfirm }: Props) {
  const renderPayment = useCallback(({ item }: { item: GroupFinancePayment }) => (
    <PaymentRow payment={item} onConfirm={onConfirm} isConfirming={confirmingId === item.id} />
  ), [confirmingId, onConfirm]);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <FlatList
        data={payments}
        keyExtractor={(item) => item.id}
        renderItem={renderPayment}
        scrollEnabled={false}
        ItemSeparatorComponent={ListSeparator}
        ListEmptyComponent={<EmptyState text={empty} />}
        removeClippedSubviews={false}
      />
    </View>
  );
}

export const PaymentList = memo(PaymentListComponent);

function ListSeparator() {
  return <View style={styles.listSeparator} />;
}
