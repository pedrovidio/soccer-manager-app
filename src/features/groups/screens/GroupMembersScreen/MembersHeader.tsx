import React, { memo } from 'react';
import { Text, View } from 'react-native';
import { BackButton } from '@ui/composites/BackButton';
import { GroupHomeShortcut } from '@features/groups/components/GroupHomeShortcut';
import { styles } from './styles';

function MembersHeaderComponent({ groupName }: { groupName: string }) {
  return (
    <View style={styles.header}>
      <BackButton />
      <View style={styles.headerBody}>
        <Text style={styles.headerTitle}>Membros</Text>
        <Text style={styles.headerSub} numberOfLines={1}>{groupName}</Text>
      </View>
      <GroupHomeShortcut />
    </View>
  );
}

export const MembersHeader = memo(MembersHeaderComponent);
