import React, { memo } from 'react';
import { Text, View } from 'react-native';
import { BackButton } from '../../../common/components/BackButton';
import { GroupHomeShortcut } from '../GroupHomeShortcut';
import { styles } from './styles';

type Props = {
  groupName: string;
};

function FinanceHeaderComponent({ groupName }: Props) {
  return (
    <View style={styles.header}>
      <BackButton />
      <View style={styles.headerBody}>
        <Text style={styles.headerTitle}>Financeiro</Text>
        <Text style={styles.headerSub} numberOfLines={1}>{groupName}</Text>
      </View>
      <GroupHomeShortcut />
    </View>
  );
}

export const FinanceHeader = memo(FinanceHeaderComponent);
