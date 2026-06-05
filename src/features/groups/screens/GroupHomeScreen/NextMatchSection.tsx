import React, { memo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Arena } from '@ui/tokens/theme';
import { GroupUpcomingMatch } from '@features/groups/groupTypes';
import { formatMatchDate, formatMatchTime } from '@features/groups/utils/matchFormatters';
import { styles } from './styles';

type Props = {
  match?: GroupUpcomingMatch;
  isAdmin: boolean;
  onCreateMatch: () => void;
  onOpenMatch: (matchId: string) => void;
  onOpenMatches: () => void;
};

function NextMatchSectionComponent({ match, isAdmin, onCreateMatch, onOpenMatch, onOpenMatches }: Props) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Proxima partida</Text>
        <TouchableOpacity onPress={onOpenMatches}>
          <Text style={styles.sectionLink}>Ver jogos</Text>
        </TouchableOpacity>
      </View>
      {match ? (
        <MatchCompactCard match={match} onPress={() => onOpenMatch(match.id)} />
      ) : (
        <View style={styles.emptyCard}>
          <Ionicons name="football-outline" size={30} color={Arena.textSubtle} />
          <Text style={styles.emptyText}>Nenhuma partida agendada</Text>
          {isAdmin && (
            <TouchableOpacity style={styles.emptyAction} onPress={onCreateMatch}>
              <Text style={styles.emptyActionText}>Marcar partida</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

function MatchCompactCard({ match, onPress }: { match: GroupUpcomingMatch; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.matchCard} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.matchDateBox}>
        <Text style={styles.matchDay}>{formatMatchDate(match.date).split(',')[0]?.toUpperCase()}</Text>
        <Text style={styles.matchDayNum}>{new Date(match.date).getDate()}</Text>
      </View>
      <View style={styles.matchBody}>
        <Text style={styles.matchLocation} numberOfLines={1}>{match.location}</Text>
        <Text style={styles.matchTime}>{formatMatchTime(match.date)}</Text>
      </View>
      <View style={styles.matchSpots}>
        <Text style={styles.matchSpotsNum}>{match.confirmedCount}/{match.totalVacancies}</Text>
        <Text style={styles.matchSpotsLabel}>confirmados</Text>
      </View>
    </TouchableOpacity>
  );
}

export const NextMatchSection = memo(NextMatchSectionComponent);
