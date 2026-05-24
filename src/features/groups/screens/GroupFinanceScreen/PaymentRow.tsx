import React, { memo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '@ui/tokens/theme';
import { GroupFinancePayment } from '@features/groups/groupTypes';
import { formatCurrency, formatDate, isExpenseType, statusLabel, typeLabel } from '@features/groups/utils/financeFormatters';
import { styles } from './styles';

type Props = {
  payment: GroupFinancePayment;
  isConfirming: boolean;
  onConfirm: (payment: GroupFinancePayment) => void;
};

function PaymentRowComponent({ payment, isConfirming, onConfirm }: Props) {
  const isExpense = isExpenseType(payment.type);
  const statusTone = payment.status === 'PAID' ? Colors.successDark : payment.isOverdue ? Colors.errorDark : Colors.warningDark;
  const canConfirm = !isExpense && payment.status === 'PENDING' && !!payment.paymentReportedAt;

  return (
    <View style={styles.rowCard}>
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle} numberOfLines={1}>{isExpense ? typeLabel(payment.type) : payment.athleteName}</Text>
        <Text style={styles.rowSub} numberOfLines={1}>
          {isExpense
            ? `${payment.description ?? 'Sem descricao'} - ${formatDate(payment.createdAt)}`
            : `${typeLabel(payment.type)} - ${payment.matchLocation ?? 'Sem partida'} - vence ${formatDate(payment.dueDate)}`}
        </Text>
        {payment.paymentReportedAt && payment.status === 'PENDING' && (
          <Text style={styles.reportedText}>Informado em {formatDate(payment.paymentReportedAt)}, aguardando confirmacao</Text>
        )}
      </View>
      <View style={styles.amounts}>
        <Text style={[styles.amountText, isExpense && styles.expenseText]}>{isExpense ? '-' : ''}{formatCurrency(payment.amount)}</Text>
        <Text style={[styles.statusText, { color: statusTone }]}>
          {payment.isOverdue ? 'Vencido' : statusLabel(payment.status)}
        </Text>
        {canConfirm && (
          <TouchableOpacity
            style={[styles.confirmBtn, isConfirming && styles.confirmBtnDisabled]}
            onPress={() => onConfirm(payment)}
            disabled={isConfirming}
            activeOpacity={0.7}
          >
            <Text style={styles.confirmBtnText}>{isConfirming ? 'Confirmando...' : 'Confirmar'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export const PaymentRow = memo(PaymentRowComponent);
