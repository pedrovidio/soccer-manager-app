import React, { memo } from 'react';
import { Text, View } from 'react-native';
import { BackButton } from '@ui/composites/BackButton';
import { styles } from './styles';

function LiveMatchHeaderComponent({ title = 'Transmissao ao Vivo' }: { title?: string }) {
  return (
    <View style={styles.header}>
      <BackButton />
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.headerSpacer} />
    </View>
  );
}

export const LiveMatchHeader = memo(LiveMatchHeaderComponent);
