import React, { memo } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Arena } from '@ui/tokens/theme';
import { MarketplaceTab } from './types';
import { styles } from './styles';

type MarketplaceHeaderProps = {
  tab: MarketplaceTab;
  isSyncingLocation: boolean;
};

function MarketplaceHeaderComponent({ tab, isSyncingLocation }: MarketplaceHeaderProps) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.headerTitle}>Onde tem jogo hoje?</Text>
        <Text style={styles.headerSub}>
          {tab === 'invites' ? 'Convites esperando sua resposta' : 'Partidas perto de você'}
        </Text>
      </View>
      {isSyncingLocation && <ActivityIndicator color={Arena.neon} />}
    </View>
  );
}

export const MarketplaceHeader = memo(MarketplaceHeaderComponent);
