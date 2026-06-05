import React, { memo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Arena } from '@ui/tokens/theme';
import { ExpenseKind } from './types';
import { styles } from './styles';

type Props = {
  onOpenExpense: (kind: ExpenseKind) => void;
  isCourtRentalPaid: boolean;
};

function FinanceActionsComponent({ onOpenExpense, isCourtRentalPaid }: Props) {
  return (
    <View style={styles.actions}>
      {isCourtRentalPaid ? (
        <View style={[styles.actionBtn, styles.actionPaid]}>
          <Ionicons name="checkmark-circle-outline" size={18} color={Arena.success} />
          <Text style={styles.actionPaidText}>Quadra paga</Text>
        </View>
      ) : (
        <TouchableOpacity style={styles.actionBtn} onPress={() => onOpenExpense('COURT_RENTAL')} activeOpacity={0.7}>
          <Ionicons name="business-outline" size={18} color={Arena.neon} />
          <Text style={styles.actionText}>Pagar quadra</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.actionBtn} onPress={() => onOpenExpense('PURCHASE')} activeOpacity={0.7}>
        <Ionicons name="cart-outline" size={18} color={Arena.neon} />
        <Text style={styles.actionText}>Registrar compra</Text>
      </TouchableOpacity>
    </View>
  );
}

export const FinanceActions = memo(FinanceActionsComponent);
