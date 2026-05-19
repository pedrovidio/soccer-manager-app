import React, { memo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../common/theme';
import { ExpenseKind } from './types';
import { styles } from './styles';

type Props = {
  onOpenExpense: (kind: ExpenseKind) => void;
};

function FinanceActionsComponent({ onOpenExpense }: Props) {
  return (
    <View style={styles.actions}>
      <TouchableOpacity style={styles.actionBtn} onPress={() => onOpenExpense('COURT_RENTAL')} activeOpacity={0.7}>
        <Ionicons name="business-outline" size={18} color={Colors.primary} />
        <Text style={styles.actionText}>Pagar quadra</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionBtn} onPress={() => onOpenExpense('PURCHASE')} activeOpacity={0.7}>
        <Ionicons name="cart-outline" size={18} color={Colors.primary} />
        <Text style={styles.actionText}>Registrar compra</Text>
      </TouchableOpacity>
    </View>
  );
}

export const FinanceActions = memo(FinanceActionsComponent);
