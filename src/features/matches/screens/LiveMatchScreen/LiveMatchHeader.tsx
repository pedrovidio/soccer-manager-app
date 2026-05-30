import React, { memo } from 'react';
import { Text, View } from 'react-native';
import { BackButton } from '@ui/composites/BackButton';
import { styles } from './styles';

function LiveMatchHeaderComponent() {
  return (
    <View style={styles.header}>
      <BackButton />
      <Text style={styles.headerTitle}>Transmissao ao Vivo</Text>
      <View style={styles.headerSpacer} />
    </View>
  );
}

export const LiveMatchHeader = memo(LiveMatchHeaderComponent);
