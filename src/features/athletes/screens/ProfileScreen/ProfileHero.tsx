import React, { memo } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Arena } from '@ui/tokens/theme';
import { formatPositionLabel } from '@features/athletes/utils/positionLabel';
import { styles } from './styles';

type Props = {
  name: string;
  initials: string;
  overall: number;
  overallColor: string;
  photoUrl?: string | null;
  plan: 'FREE' | 'PREMIUM';
  position: string;
  status: string;
  statusStyle: { bg: string; color: string };
  onEdit: () => void;
};

function ProfileHeroComponent({ name, initials, overall, overallColor, photoUrl, plan, position, status, statusStyle, onEdit }: Props) {
  const isPremium = plan === 'PREMIUM';

  return (
    <View style={styles.heroCard}>
      <TouchableOpacity style={styles.editBtn} onPress={onEdit}>
        <Ionicons name="create-outline" size={18} color={Arena.text} />
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
        <View style={[styles.planBadge, isPremium ? styles.planBadgePremium : styles.planBadgeFree]}>
          <Ionicons
            name={isPremium ? 'star' : 'leaf-outline'}
            size={12}
            color={isPremium ? Arena.buttonLabelPrimary : Arena.textSubtle}
          />
          <Text style={[styles.planText, isPremium ? styles.planTextPremium : styles.planTextFree]}>
            {isPremium ? 'Premium' : 'Free'}
          </Text>
        </View>
      </View>
    </View>
  );
}

export const ProfileHero = memo(ProfileHeroComponent);
