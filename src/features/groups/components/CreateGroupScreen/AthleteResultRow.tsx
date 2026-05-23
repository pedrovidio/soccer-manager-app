import React, { memo, useCallback } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../../ui/tokens/theme';
import { AthleteSearchResult } from '../../groupTypes';
import { positionLabel } from '../../utils/athleteLabels';
import { styles } from './styles';

type Props = {
  athlete: AthleteSearchResult;
  selected: boolean;
  onToggle: (athlete: AthleteSearchResult) => void;
};

function AthleteResultRowComponent({ athlete, selected, onToggle }: Props) {
  const handlePress = useCallback(() => onToggle(athlete), [athlete, onToggle]);

  return (
    <TouchableOpacity
      style={[styles.athleteRow, selected ? styles.athleteRowSelected : null]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.athleteAvatar}>
        <Text style={styles.athleteAvatarText}>{athlete.name.slice(0, 2).toUpperCase()}</Text>
      </View>
      <View style={styles.athleteBody}>
        <Text style={styles.athleteName}>{athlete.name}</Text>
        <View style={styles.athleteMeta}>
          <View style={styles.posTag}>
            <Text style={styles.posTagText}>{positionLabel(athlete.position)}</Text>
          </View>
          <Text style={styles.athleteOverall}>OVR {athlete.overall}</Text>
        </View>
      </View>
      <View style={[styles.checkCircle, selected ? styles.checkCircleActive : null]}>
        {selected && <Ionicons name="checkmark" size={14} color={Colors.white} />}
      </View>
    </TouchableOpacity>
  );
}

export const AthleteResultRow = memo(AthleteResultRowComponent);
