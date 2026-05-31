import React, { memo } from 'react';
import { SegmentedControl } from '@ui/primitives/SegmentedControl';
import { MarketplaceTab } from './types';

type MarketplaceTabsProps = {
  activeTab: MarketplaceTab;
  inviteCount: number;
  matchCount: number;
  onChange: (tab: MarketplaceTab) => void;
};

function MarketplaceTabsComponent({ activeTab, inviteCount, matchCount, onChange }: MarketplaceTabsProps) {
  const options = [
    { value: 'invites' as const, label: `Convites (${inviteCount})` },
    { value: 'search' as const, label: `Buscar jogos (${matchCount})` },
  ];

  return (
    <SegmentedControl
      options={options}
      value={activeTab}
      onChange={onChange}
      style={{ marginHorizontal: 24, marginVertical: 12 }}
    />
  );
}

export const MarketplaceTabs = memo(MarketplaceTabsComponent);
