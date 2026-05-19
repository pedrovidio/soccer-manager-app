import React, { memo, useMemo } from 'react';
import { FlatList, Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { GroupMember } from '../../groupTypes';
import { positionLabel } from '../../utils/athleteLabels';
import { normalizeStat } from '../../utils/memberStats';
import { styles } from './styles';

type Props = {
  member: GroupMember | null;
  onClose: () => void;
};

type StatItem = {
  label: string;
  value: number;
};

function MemberProfileModalComponent({ member, onClose }: Props) {
  const statItems = useMemo<StatItem[]>(() => {
    const stats = member?.averageStats;
    if (!stats) return [];
    return [
      { label: 'Velocidade', value: normalizeStat(stats.pace) },
      { label: 'Finalizacao', value: normalizeStat(stats.shooting) },
      { label: 'Passe', value: normalizeStat(stats.passing) },
      { label: 'Drible', value: normalizeStat(stats.dribbling) },
      { label: 'Defesa', value: normalizeStat(stats.defense) },
      { label: 'Fisico', value: normalizeStat(stats.physical) },
    ];
  }, [member?.averageStats]);

  if (!member) return null;

  return (
    <Modal transparent statusBarTranslucent animationType="slide" visible onRequestClose={onClose}>
      <Pressable style={styles.profileOverlay} onPress={onClose}>
        <Pressable style={styles.profileSheet} onPress={(event) => event.stopPropagation()}>
          <View style={styles.profileHandle} />
          <View style={styles.profileHeader}>
            <View style={[styles.profileAvatar, member.isAdmin && styles.memberAvatarAdmin]}>
              <Text style={[styles.profileAvatarText, member.isAdmin && styles.memberAvatarTextAdmin]}>
                {member.name.slice(0, 2).toUpperCase()}
              </Text>
            </View>
            <View style={styles.profileBody}>
              <Text style={styles.profileName} numberOfLines={1}>{member.name}</Text>
              <View style={[styles.posTag, { alignSelf: 'flex-start', marginTop: 4 }]}>
                <Text style={styles.posTagText}>{positionLabel(member.position)}</Text>
              </View>
            </View>
            <View style={styles.profileOvr}>
              <Text style={styles.profileOvrNum}>{member.overall}</Text>
              <Text style={styles.profileOvrLbl}>OVR</Text>
            </View>
          </View>
          <Text style={styles.profileStatsTitle}>Atributos tecnicos</Text>
          <FlatList
            data={statItems}
            keyExtractor={(item) => item.label}
            renderItem={({ item }) => <StatRow item={item} />}
            scrollEnabled={false}
            ListEmptyComponent={<Text style={styles.profileNoStats}>Sem partidas avaliadas ainda</Text>}
          />
          <TouchableOpacity style={styles.profileCloseBtn} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.profileCloseBtnText}>Fechar</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function StatRow({ item }: { item: StatItem }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{item.label}</Text>
      <View style={styles.statBarBg}>
        <View style={[styles.statBarFill, { width: `${item.value}%` }]} />
      </View>
      <Text style={styles.statValue} numberOfLines={1}>{item.value}/100</Text>
    </View>
  );
}

export const MemberProfileModal = memo(MemberProfileModalComponent);
