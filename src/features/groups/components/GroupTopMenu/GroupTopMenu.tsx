import React, { memo, useCallback } from 'react';
import { FlatList, ListRenderItemInfo } from 'react-native';
import { TopMenuItem } from './TopMenuItem';
import { GroupTopMenuItem, GroupTopMenuTab } from './types';
import { styles } from './styles';
import { useGroupTopMenu } from './useGroupTopMenu';

interface GroupTopMenuProps {
  groupId: string;
  active: GroupTopMenuTab;
  showFinance?: boolean;
}

function GroupTopMenuComponent({ groupId, active, showFinance = true }: GroupTopMenuProps) {
  const { items, navigate } = useGroupTopMenu({ active, groupId, showFinance });

  const renderItem = useCallback(({ item }: ListRenderItemInfo<GroupTopMenuItem>) => (
    <TopMenuItem item={item} active={active === item.key} onPress={navigate} />
  ), [active, navigate]);

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.key}
      renderItem={renderItem}
      horizontal
      scrollEnabled={false}
      style={styles.wrap}
      removeClippedSubviews={false}
    />
  );
}

export const GroupTopMenu = memo(GroupTopMenuComponent);
