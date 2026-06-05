import React, { memo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Arena } from '@ui/tokens/theme';
import { FavoriteSpotAthlete } from '@features/groups/groupTypes';
import { positionLabel } from '@features/groups/utils/athleteLabels';
import { styles } from './styles';

type Props = {
  item: FavoriteSpotAthlete;
  disabled: boolean;
  onRemove: (athleteId: string) => void;
};

function FavoriteSpotAthleteRowComponent({ item, disabled, onRemove }: Props) {
  return (
    <View style={styles.favoriteRow}>
      <View style={styles.favoriteAvatar}>
        <Text style={styles.favoriteAvatarText}>{item.name.slice(0, 2).toUpperCase()}</Text>
      </View>
      <View style={styles.favoriteBody}>
        <Text style={styles.favoriteName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.favoriteMeta}>{positionLabel(item.position)} - {item.age} anos - OVR {item.overall}</Text>
      </View>
      <TouchableOpacity style={styles.favoriteRemoveBtn} onPress={() => onRemove(item.athleteId)} disabled={disabled} activeOpacity={0.7}>
        <Ionicons name="star" size={18} color={Arena.warning} />
      </TouchableOpacity>
    </View>
  );
}

export const FavoriteSpotAthleteRow = memo(FavoriteSpotAthleteRowComponent);
