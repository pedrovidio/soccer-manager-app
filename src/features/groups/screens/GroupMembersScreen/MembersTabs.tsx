import React, { memo } from 'react';
import { SegmentedControl } from '@ui/primitives/SegmentedControl';
import { MembersTab } from './types';

type Props = {
  activeTab: MembersTab;
  membersCount: number;
  spotCount: number;
  isAdmin: boolean;
  onChange: (tab: MembersTab) => void;
};

function MembersTabsComponent({ activeTab, membersCount, spotCount, isAdmin, onChange }: Props) {
  const options = [
    { value: 'members' as const, label: `Membros (${membersCount})` },
    ...(isAdmin ? [{ value: 'spot' as const, label: `Avulsos (${spotCount})` }] : []),
  ];

  return (
    <SegmentedControl
      options={options}
      value={activeTab}
      onChange={onChange}
      style={{ marginHorizontal: 16, marginTop: 12, marginBottom: 8 }}
    />
  );
}

export const MembersTabs = memo(MembersTabsComponent);
