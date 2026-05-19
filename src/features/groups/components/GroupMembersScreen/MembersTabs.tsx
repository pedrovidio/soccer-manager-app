import React, { memo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { MembersTab } from './types';
import { styles } from './styles';

type Props = {
  activeTab: MembersTab;
  membersCount: number;
  spotCount: number;
  isAdmin: boolean;
  onChange: (tab: MembersTab) => void;
};

function MembersTabsComponent({ activeTab, membersCount, spotCount, isAdmin, onChange }: Props) {
  return (
    <View style={styles.tabs}>
      <TabButton label={`Membros (${membersCount})`} active={activeTab === 'members'} onPress={() => onChange('members')} />
      {isAdmin && (
        <TabButton label={`Avulsos (${spotCount})`} active={activeTab === 'spot'} onPress={() => onChange('spot')} />
      )}
    </View>
  );
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.tabBtn, active && styles.tabBtnActive]} onPress={onPress} activeOpacity={0.7}>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

export const MembersTabs = memo(MembersTabsComponent);
