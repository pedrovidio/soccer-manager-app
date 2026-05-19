import React, { memo } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Colors } from '../../common/theme';
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
        <Text style={styles.headerTitle}>Buscar jogos</Text>
        <Text style={styles.headerSub}>{tab === 'invites' ? 'Convites recebidos' : 'Partidas perto de você'}</Text>
      </View>
      {isSyncingLocation && <ActivityIndicator color={Colors.primary} />}
    </View>
  );
}

export const MarketplaceHeader = memo(MarketplaceHeaderComponent);
