import React, { memo, useCallback } from 'react';
import { FlatList, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { MarketplaceTab } from './types';
import { styles } from './styles';

type TabOption = {
  key: MarketplaceTab;
  label: string;
};

type MarketplaceTabsProps = {
  activeTab: MarketplaceTab;
  inviteCount: number;
  matchCount: number;
  onChange: (tab: MarketplaceTab) => void;
};

function MarketplaceTabsComponent({ activeTab, inviteCount, matchCount, onChange }: MarketplaceTabsProps) {
  const { width } = useWindowDimensions();
  const tabWidth = (width - 48) / 2;
  const options: TabOption[] = [
    { key: 'invites', label: `Convites (${inviteCount})` },
    { key: 'search', label: `Buscar jogos (${matchCount})` },
  ];

  const renderItem = useCallback(({ item }: { item: TabOption }) => {
    const active = activeTab === item.key;

    return (
      <TouchableOpacity
        style={[styles.tabBtn, active ? styles.tabBtnActive : null, { width: tabWidth }]}
        onPress={() => onChange(item.key)}
        activeOpacity={0.7}
      >
        <Text style={[styles.tabText, active ? styles.tabTextActive : null]}>{item.label}</Text>
      </TouchableOpacity>
    );
  }, [activeTab, onChange, tabWidth]);

  return (
    <View style={styles.tabs}>
      <FlatList
        data={options}
        horizontal
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        scrollEnabled={false}
      />
    </View>
  );
}

export const MarketplaceTabs = memo(MarketplaceTabsComponent);
