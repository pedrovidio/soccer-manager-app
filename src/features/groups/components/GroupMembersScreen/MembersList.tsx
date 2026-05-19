import React, { memo, useCallback } from 'react';
import { FlatList, RefreshControl, Text } from 'react-native';
import { Colors } from '../../../common/theme';
import { GroupMember } from '../../groupTypes';
import { MemberRow } from './MemberRow';
import { MemberListItem } from './types';
import { styles } from './styles';

type Props = {
  items: MemberListItem[];
  isAdmin: boolean;
  currentAthleteId: string;
  refreshing: boolean;
  onRefresh: () => void;
  onOpenProfile: (member: GroupMember) => void;
  onOpenOptions: (member: GroupMember) => void;
};

function MembersListComponent({ items, isAdmin, currentAthleteId, refreshing, onRefresh, onOpenProfile, onOpenOptions }: Props) {
  const renderItem = useCallback(({ item }: { item: MemberListItem }) => {
    if (item.kind === 'label') return <Text style={styles.groupLabel}>{item.label}</Text>;

    return (
      <MemberRow
        member={item.member}
        onPress={onOpenProfile}
        onOptions={isAdmin && item.member.id !== currentAthleteId ? onOpenOptions : undefined}
      />
    );
  }, [currentAthleteId, isAdmin, onOpenOptions, onOpenProfile]);

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.listContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
      initialNumToRender={12}
      maxToRenderPerBatch={12}
      windowSize={9}
      removeClippedSubviews
    />
  );
}

export const MembersList = memo(MembersListComponent);
