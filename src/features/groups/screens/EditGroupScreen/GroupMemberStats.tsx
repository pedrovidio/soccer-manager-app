import React, { memo } from 'react';
import { Text, View } from 'react-native';
import { GroupResponse } from '../../groupTypes';
import { styles } from './styles';

type Props = {
  group: GroupResponse;
};

function GroupMemberStatsComponent({ group }: Props) {
  return (
    <>
      <View style={styles.divider} />
      <Text style={styles.sectionLabel}>Membros</Text>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Administradores</Text>
        <Text style={styles.infoValue}>{group.adminIds.length}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Mensalistas</Text>
        <Text style={styles.infoValue}>{group.memberIds.length}</Text>
      </View>
    </>
  );
}

export const GroupMemberStats = memo(GroupMemberStatsComponent);
