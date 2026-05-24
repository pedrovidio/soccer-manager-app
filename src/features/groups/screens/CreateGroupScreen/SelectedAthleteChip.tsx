import React, { memo, useCallback } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@ui/tokens/theme';
import { AthleteSearchResult } from '@features/groups/groupTypes';
import { styles } from './styles';

type Props = {
  athlete: AthleteSearchResult;
  onRemove: (id: string) => void;
};

function SelectedAthleteChipComponent({ athlete, onRemove }: Props) {
  const handleRemove = useCallback(() => onRemove(athlete.id), [athlete.id, onRemove]);

  return (
    <View style={styles.chip}>
      <View style={styles.chipAvatar}>
        <Text style={styles.chipAvatarText}>{athlete.name.slice(0, 2).toUpperCase()}</Text>
      </View>
      <Text style={styles.chipName} numberOfLines={1}>{athlete.name.split(' ')[0]}</Text>
      <TouchableOpacity onPress={handleRemove} hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}>
        <Ionicons name="close-circle" size={16} color={Colors.n400} />
      </TouchableOpacity>
    </View>
  );
}

export const SelectedAthleteChip = memo(SelectedAthleteChipComponent);
