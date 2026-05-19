import React, { memo } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../common/theme';
import { formatPositionLabel } from '../../utils/positionLabel';
import { styles } from './styles';

type Props = {
  name: string;
  initials: string;
  overall: number;
  overallColor: string;
  photoUrl?: string | null;
  position: string;
  status: string;
  statusStyle: { bg: string; color: string };
  onEdit: () => void;
};

function ProfileHeroComponent({ name, initials, overall, overallColor, photoUrl, position, status, statusStyle, onEdit }: Props) {
  return (
    <View style={styles.heroCard}>
      <TouchableOpacity style={styles.editBtn} onPress={onEdit}>
        <Ionicons name="create-outline" size={18} color={Colors.n700} />
      </TouchableOpacity>
      {photoUrl ? (
        <Image source={{ uri: photoUrl }} style={styles.avatar} />
      ) : (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
      )}
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.positionText}>{formatPositionLabel(position)}</Text>
      <View style={styles.heroRow}>
        <View style={[styles.ovrBadge, { backgroundColor: overallColor }]}>
          <Text style={styles.ovrNum}>{overall}</Text>
          <Text style={styles.ovrLbl}>OVR</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.statusText, { color: statusStyle.color }]}>{status}</Text>
        </View>
      </View>
    </View>
  );
}

export const ProfileHero = memo(ProfileHeroComponent);
