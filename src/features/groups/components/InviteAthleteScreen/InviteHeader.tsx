import React, { memo } from 'react';
import { Text, View } from 'react-native';
import { BackButton } from '../../../../ui/composites/BackButton';
import { styles } from './styles';

function InviteHeaderComponent({ groupName }: { groupName?: string }) {
  return (
    <View style={styles.header}>
      <BackButton />
      <View style={styles.headerBody}>
        <Text style={styles.headerTitle}>Convidar atleta</Text>
        {groupName ? <Text style={styles.headerSub} numberOfLines={1}>{groupName}</Text> : null}
      </View>
    </View>
  );
}

export const InviteHeader = memo(InviteHeaderComponent);
