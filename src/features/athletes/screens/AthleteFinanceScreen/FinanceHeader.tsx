import React, { memo } from 'react';
import { Text, View } from 'react-native';
import { BackButton } from '../../../../ui/composites/BackButton';
import { styles } from './styles';

function FinanceHeaderComponent({ athleteName }: { athleteName: string }) {
  return (
    <View style={styles.header}>
      <BackButton />
      <View style={styles.headerBody}>
        <Text style={styles.headerTitle}>Meu financeiro</Text>
        <Text style={styles.headerSub}>{athleteName}</Text>
      </View>
    </View>
  );
}

export const FinanceHeader = memo(FinanceHeaderComponent);
