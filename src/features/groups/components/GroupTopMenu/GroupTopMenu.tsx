import React, { memo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SegmentedControl } from '@ui/primitives/SegmentedControl';
import { GroupTopMenuTab } from './types';
import { useGroupTopMenu } from './useGroupTopMenu';

interface GroupTopMenuProps {
  groupId: string;
  active: GroupTopMenuTab;
  showFinance?: boolean;
}

function GroupTopMenuComponent({ groupId, active, showFinance = true }: GroupTopMenuProps) {
  const { bottom } = useSafeAreaInsets();
  const { items, navigate, prevTab } = useGroupTopMenu({ active, groupId, showFinance });

  const options = items.map((item) => ({
    value: item.key,
    label: item.label,
  }));

  const handleChange = (val: GroupTopMenuTab) => {
    const selected = items.find((item) => item.key === val);
    if (selected) {
      navigate(selected);
    }
  };

  return (
    <SegmentedControl
      options={options}
      value={active}
      prevValue={prevTab as any}
      onChange={handleChange}
      style={{ marginHorizontal: 16, marginTop: 8, marginBottom: Math.max(bottom + 8, 12) }}
    />
  );
}

export const GroupTopMenu = memo(GroupTopMenuComponent);
