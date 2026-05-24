import React, { memo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../../../ui/tokens/theme';
import { GroupUpcomingMatch } from '../../groupTypes';
import { formatMatchDate, formatMatchTime } from '../../utils/matchFormatters';
import { styles } from './styles';

type Props = {
  match: GroupUpcomingMatch;
  onPress: (matchId: string) => void;
};

function MatchRowComponent({ match, onPress }: Props) {
  const spotsLeft = match.totalVacancies - match.confirmedCount;

  return (
    <TouchableOpacity style={styles.matchCard} onPress={() => onPress(match.id)} activeOpacity={0.75}>
      <View style={styles.matchDateBox}>
        <Text style={styles.matchDay}>{formatMatchDate(match.date).split(',')[0]?.toUpperCase()}</Text>
        <Text style={styles.matchDayNum}>{new Date(match.date).getDate()}</Text>
      </View>
      <View style={styles.matchBody}>
        <Text style={styles.matchLocation} numberOfLines={1}>{match.location}</Text>
        <Text style={styles.matchTime}>{formatMatchTime(match.date)}</Text>
      </View>
      <View style={styles.matchSpots}>
        <Text style={[styles.matchSpotsNum, { color: spotsLeft === 0 ? Colors.error : Colors.success }]}>
          {match.confirmedCount}/{match.totalVacancies}
        </Text>
        <Text style={styles.matchSpotsLabel}>confirmados</Text>
      </View>
    </TouchableOpacity>
  );
}

export const MatchRow = memo(MatchRowComponent);
