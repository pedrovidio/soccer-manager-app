import React, { memo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@ui/tokens/theme';
import { GroupMember } from '@features/groups/groupTypes';
import { positionLabel } from '@features/groups/utils/athleteLabels';
import { StatusTag } from './StatusTag';
import { styles } from './styles';

type Props = {
  member: GroupMember;
  onPress: (member: GroupMember) => void;
  onOptions?: (member: GroupMember) => void;
};

function MemberRowComponent({ member, onPress, onOptions }: Props) {
  return (
    <TouchableOpacity style={styles.memberRow} onPress={() => onPress(member)} activeOpacity={0.7}>
      <View style={[styles.memberAvatar, member.isAdmin && styles.memberAvatarAdmin]}>
        <Text style={[styles.memberAvatarText, member.isAdmin && styles.memberAvatarTextAdmin]}>
          {member.name.slice(0, 2).toUpperCase()}
        </Text>
      </View>
      <View style={styles.memberBody}>
        <View style={styles.memberNameRow}>
          <Text style={styles.memberName} numberOfLines={1}>{member.name}</Text>
          {member.isAdmin && <View style={styles.adminBadge}><Text style={styles.adminBadgeText}>Admin</Text></View>}
        </View>
        <View style={styles.memberMeta}>
          <View style={styles.posTag}><Text style={styles.posTagText}>{positionLabel(member.position)}</Text></View>
          <Text style={styles.memberOverall}>OVR {member.overall}</Text>
          {member.isInjured && <StatusTag label="Lesionado" tone="warning" />}
          {member.isBlocked && <StatusTag label="Bloqueado" tone="neutral" />}
          {member.hasDebt && <StatusTag label="Devedor" tone="error" />}
        </View>
      </View>
      {onOptions && (
        <TouchableOpacity onPress={() => onOptions(member)} hitSlop={12} activeOpacity={0.7}>
          <Ionicons name="ellipsis-vertical" size={16} color={Colors.n400} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

export const MemberRow = memo(MemberRowComponent);
