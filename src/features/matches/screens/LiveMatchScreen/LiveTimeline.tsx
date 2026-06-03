import React, { memo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '@ui/tokens/theme';
import type { LiveMatchData, LiveMatchEvent, LiveMatchTeam } from '../../types';
import { styles } from './styles';

type Props = {
  match: LiveMatchData;
  goalEvents: LiveMatchEvent[];
  canDeleteGoal: boolean;
  onDeleteGoal: (eventId: string) => void;
};

function LiveTimelineComponent({ match, goalEvents, canDeleteGoal, onDeleteGoal }: Props) {
  return (
    <View style={styles.timeline}>
      <Text style={styles.sectionTitle}>Linha do tempo</Text>
      {goalEvents.length === 0 ? (
        <View style={styles.emptyTimeline}>
          <Text style={styles.emptyText}>Nenhum gol registrado ainda.</Text>
        </View>
      ) : (
        goalEvents.map((event) => (
          <View key={event.id} style={styles.eventRow}>
            <View style={styles.minuteBadge}>
              <Text style={styles.minuteText}>{event.minute}'</Text>
            </View>
            <View style={styles.eventContent}>
              <Text style={styles.eventTitle}>
                {event.type === 'OWN_GOAL' ? 'Gol contra' : 'Gol'} - {teamNameFor(match, event.teamType)}
              </Text>
              <Text style={styles.eventSubtitle}>{event.athleteName ?? 'Jogador nao informado'}</Text>
            </View>
            {canDeleteGoal && (
              <TouchableOpacity
                activeOpacity={0.72}
                onPress={() => onDeleteGoal(event.id)}
                style={styles.deleteEventButton}
              >
                <Ionicons name="trash-outline" size={18} color={Colors.error} />
              </TouchableOpacity>
            )}
          </View>
        ))
      )}
    </View>
  );
}

function teamNameFor(match: LiveMatchData, team: LiveMatchTeam) {
  return team === 'HOME' ? match.homeTeamName : match.awayTeamName;
}

export const LiveTimeline = memo(LiveTimelineComponent);
