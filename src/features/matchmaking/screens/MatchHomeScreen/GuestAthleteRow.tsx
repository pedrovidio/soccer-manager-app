import React, { memo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@ui/tokens/theme';
import { NearbyAthlete } from '@features/matchmaking/types';
import { posLabel } from '@features/matchmaking/utils/formatters';
import { s } from '../MatchHomeScreen.styles';

type GuestAthleteRowProps = {
  athlete: NearbyAthlete;
  isFavoritePending: boolean;
  isSelected: boolean;
  onFavorite: (athlete: NearbyAthlete) => void;
  onToggle: (athleteId: string) => void;
};

function GuestAthleteRowComponent({
  athlete,
  isFavoritePending,
  isSelected,
  onFavorite,
  onToggle,
}: GuestAthleteRowProps) {
  return (
    <TouchableOpacity
      style={[s.guestRow, isSelected && s.guestRowSelected]}
      onPress={() => onToggle(athlete.id)}
      activeOpacity={0.75}
    >
      <View style={[s.selectCircle, isSelected && s.selectCircleActive]}>
        {isSelected && <Ionicons name="checkmark" size={14} color={Colors.white} />}
      </View>
      <View style={s.guestAvatar}>
        <Text style={s.guestAvatarText}>{(athlete.name ?? '??').slice(0, 2).toUpperCase()}</Text>
      </View>
      <View style={s.rowContent}>
        <Text style={s.guestName}>{athlete.name}</Text>
        <Text style={s.guestSub}>
          {posLabel(athlete.position ?? '')} - {athlete.age} anos - {athlete.gender === 'M' ? 'Masc.' : 'Fem.'}
        </Text>
      </View>
      <View style={[s.ovrBadge, athlete.overall >= 70 ? s.ovrHigh : athlete.overall >= 50 ? s.ovrMid : s.ovrLow]}>
        <Text style={s.ovrText}>{athlete.overall}</Text>
      </View>
      <TouchableOpacity
        style={[s.favoriteBtn, athlete.isFavorite && s.favoriteBtnActive]}
        onPress={(event) => {
          event.stopPropagation();
          onFavorite(athlete);
        }}
        disabled={isFavoritePending}
        activeOpacity={0.7}
      >
        <Ionicons
          name={athlete.isFavorite ? 'star' : 'star-outline'}
          size={18}
          color={athlete.isFavorite ? Colors.warningDark : Colors.n400}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export const GuestAthleteRow = memo(GuestAthleteRowComponent);
