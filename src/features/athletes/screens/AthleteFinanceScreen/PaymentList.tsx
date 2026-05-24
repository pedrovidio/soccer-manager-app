import React, { memo, useCallback } from 'react';
import { FlatList, Text, View } from 'react-native';
import { AthleteFinancePayment } from '../../athleteTypes';
import { EmptyState } from './EmptyState';
import { PaymentRow } from './PaymentRow';
import { styles } from './styles';

type Props = {
  title: string;
  empty: string;
  payments: AthleteFinancePayment[];
  onPay: (payment: AthleteFinancePayment) => void;
};

function PaymentListComponent({ title, empty, payments, onPay }: Props) {
  const renderPayment = useCallback(({ item }: { item: AthleteFinancePayment }) => (
    <PaymentRow payment={item} onPay={onPay} />
  ), [onPay]);

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

function ListSeparator() {
  return <View style={styles.listSeparator} />;
}

export const PaymentList = memo(PaymentListComponent);
