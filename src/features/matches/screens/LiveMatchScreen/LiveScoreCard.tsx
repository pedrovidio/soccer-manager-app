import React, { memo } from 'react';
import { Text, View } from 'react-native';
import type { LiveMatchData } from '../../types';
import { styles } from './styles';

type Props = {
  match: LiveMatchData;
  now: number;
};

function LiveScoreCardComponent({ match, now }: Props) {
  return (
    <View style={styles.scoreCard}>
      <Text style={styles.liveLabel}>{match.status === 'IN_PROGRESS' ? 'AO VIVO' : 'PARTIDA'}</Text>
      <Text style={styles.clock}>{formatClock(match, now)}</Text>
      <View style={styles.scoreRow}>
        <Text style={styles.teamName}>{match.homeTeamName}</Text>
        <Text style={styles.score}>{match.homeScore} x {match.awayScore}</Text>
        <Text style={styles.teamName}>{match.awayTeamName}</Text>
      </View>
    </View>
  );
}

function formatClock(match: LiveMatchData, now: number) {
  if (!match.startedAt) return '00:00';

  const endTime = match.endedAt ? new Date(match.endedAt).getTime() : now;
  const elapsedSeconds = Math.max(0, Math.floor((endTime - new Date(match.startedAt).getTime()) / 1000));
  const minutes = Math.floor(elapsedSeconds / 60).toString().padStart(2, '0');
  const seconds = (elapsedSeconds % 60).toString().padStart(2, '0');

  return `${minutes}:${seconds}`;
}

export const LiveScoreCard = memo(LiveScoreCardComponent);
