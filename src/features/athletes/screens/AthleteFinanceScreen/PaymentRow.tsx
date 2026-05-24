import React, { memo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '@ui/tokens/theme';
import { AthleteFinancePayment } from '@features/athletes/athleteTypes';
import { formatCurrency, formatDate, statusLabel, typeLabel } from '@features/athletes/utils/athleteFinanceFormatters';
import { styles } from './styles';

type Props = {
  payment: AthleteFinancePayment;
  onPay: (payment: AthleteFinancePayment) => void;
};

function PaymentRowComponent({ payment, onPay }: Props) {
  const canPay = payment.status === 'PENDING';
  const color = payment.status === 'PAID' ? Colors.successDark : payment.isOverdue ? Colors.errorDark : Colors.warningDark;

  return (
    <View style={styles.rowCard}>
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle} numberOfLines={1}>{typeLabel(payment.type)}</Text>
        <Text style={styles.rowSub} numberOfLines={1}>
          {payment.group?.name ?? 'Sem grupo'} - {payment.match?.location ?? 'Mensalidade'} - vence {formatDate(payment.dueDate)}
        </Text>
        {payment.paymentReportedAt && payment.status === 'PENDING' && (
          <Text style={styles.reportedText}>Pagamento informado ao administrador</Text>
        )}
      </View>
      <View style={styles.amounts}>
        <Text style={styles.amountText}>{formatCurrency(payment.amount)}</Text>
        <Text style={[styles.statusText, { color }]}>{statusLabel(payment)}</Text>
        {canPay && (
          <TouchableOpacity style={styles.payBtn} onPress={() => onPay(payment)} activeOpacity={0.7}>
            <Text style={styles.payBtnText}>Pagar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export const PaymentRow = memo(PaymentRowComponent);
