import React, { memo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Arena } from '@ui/tokens/theme';
import { styles } from './styles';

type Props = {
  count: number;
  onPress: () => void;
};

function ReviewPaymentsCardComponent({ count, onPress }: Props) {
  if (count <= 0) return null;

  return (
    <TouchableOpacity style={styles.reviewCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.reviewIcon}>
        <Ionicons name="receipt-outline" size={22} color={Arena.warning} />
      </View>
      <View style={styles.reviewBody}>
        <Text style={styles.reviewTitle}>Pagamentos para conferir</Text>
        <Text style={styles.reviewText}>
          {count} pagamento{count !== 1 ? 's' : ''} informado{count !== 1 ? 's' : ''} aguardando conferencia
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Arena.textSubtle} />
    </TouchableOpacity>
  );
}

export const ReviewPaymentsCard = memo(ReviewPaymentsCardComponent);
