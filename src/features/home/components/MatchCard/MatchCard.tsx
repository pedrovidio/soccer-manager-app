import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ConfirmedMatch } from '@features/athletes/athleteTypes';
import { Colors } from '@ui/tokens/theme';
import { styles } from './MatchCard.styles';
import { deriveMatchPhase, phaseLabel } from '@features/matchmaking/utils/matchPhase';

const TYPE_STYLE: Record<string, object> = {
  CAMPO:   styles.tagCampo,
  SOCIETY: styles.tagSociety,
  FUTSAL:  styles.tagFutsal,
};

const TYPE_LABEL: Record<string, string> = {
  CAMPO: 'Campo', SOCIETY: 'Society', FUTSAL: 'Futsal',
};

interface MatchCardProps {
  match: ConfirmedMatch;
  athleteId?: string;
}

export function MatchCard({ match, athleteId }: MatchCardProps) {
  const router = useRouter();
  const fillPct = match.totalSlots > 0 ? (match.confirmedSlots / match.totalSlots) * 100 : 0;
  const isFinished = match.status === 'FINISHED';
  const isLive = match.status === 'IN_PROGRESS';
  const isAdmin = match.isGroupAdmin === true;
  const hasMatchmaking = match.hasMatchmaking === true && !!match.matchmakingResult;
  const phase = match.phase ?? deriveMatchPhase({
    status: match.status,
    type: match.type,
    confirmedCount: match.confirmedSlots,
    isDrafted: match.isDrafted,
    hasMatchmaking,
  });
  const myTeam = hasMatchmaking
    ? match.matchmakingResult!.teams.find((team) => team.athletes.some((athlete) => athlete.id === athleteId))
    : null;
  const handlePress = () => {
    if (isLive) {
      router.push(`/matches/live/${match.id}` as any);
      return;
    }
    router.push({ pathname: '/matches/match-home', params: { matchId: match.id, groupId: match.groupId, isAdmin: isAdmin ? '1' : '0' } } as any);
  };

  return (
    <TouchableOpacity
      style={[styles.card, isLive && styles.liveCard]}
      activeOpacity={0.8}
      onPress={handlePress}
    >
      {/* HEADER: data + badge confirmado */}
      <View style={styles.header}>
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={13} color={Colors.n500} />
          <Text style={styles.dateText}>{match.date}</Text>
          <View style={styles.dot} />
          <Ionicons name="time-outline" size={13} color={Colors.n500} />
          <Text style={styles.dateText}>{match.time}</Text>
        </View>
        {isLive ? (
          <View style={styles.livePill}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>AO VIVO</Text>
          </View>
        ) : !isFinished && (
          <View style={styles.confPill}>
            <Ionicons name={phase === 'WAITING_CONFIRMATION' ? 'time-outline' : 'checkmark'} size={10} color={Colors.successDark} />
            <Text style={styles.confText}>{phase === 'WAITING_CONFIRMATION' ? 'Convocado' : 'Confirmado'}</Text>
          </View>
        )}
      </View>

      {/* BODY */}
      <View style={styles.body}>
        {/* tipo de jogo */}
        <Text style={[styles.typeTag, TYPE_STYLE[match.type]]}>
          {TYPE_LABEL[match.type] ?? match.type}
        </Text>

        {/* vagas */}
        <View style={styles.slotsRow}>
          <Ionicons name="people-outline" size={14} color={Colors.primary} />
          <Text style={styles.slotsText}>
            {match.confirmedSlots}/{match.totalSlots} vagas
          </Text>
        </View>
        <View style={styles.progBg}>
          <View style={[styles.progFill, { width: `${fillPct}%` as any }]} />
        </View>

        {!isFinished && (
          <View style={isLive ? styles.liveShortcut : phase === 'WAITING_CONFIRMATION' ? styles.waitingBox : styles.drawShortcut}>
            <Ionicons
              name={phase === 'IN_PROGRESS' ? 'play-circle-outline' : phase === 'WAITING_CONFIRMATION' ? 'hourglass-outline' : 'shuffle-outline'}
              size={15}
              color={isLive ? Colors.errorDark : phase === 'WAITING_CONFIRMATION' ? Colors.warningDark : Colors.primary}
            />
            <Text style={isLive ? styles.liveShortcutText : phase === 'WAITING_CONFIRMATION' ? styles.waitingText : styles.drawShortcutText}>
              {isLive ? 'Assistir transmissao agora' : isAdmin && phase === 'CONFIRMED_WAITING_DRAW' ? 'Jogo confirmado. Sortear times.' : phaseLabel(phase)}
            </Text>
          </View>
        )}

        {!isFinished && hasMatchmaking && (
          <View style={styles.teamsBox}>
            <Text style={styles.teamsTitle}>
              {myTeam ? `Voce esta no ${myTeam.name ?? `Time ${myTeam.teamNumber}`}` : 'Times sorteados'}
            </Text>
            {match.matchmakingResult!.teams.map((team) => (
              <View key={team.teamNumber} style={[styles.teamLine, myTeam?.teamNumber === team.teamNumber && styles.myTeamLine]}>
                <Text style={[styles.teamName, myTeam?.teamNumber === team.teamNumber && styles.myTeamName]}>
                  {team.name ?? `Time ${team.teamNumber}`}
                </Text>
                <Text style={styles.teamPlayers} numberOfLines={2}>
                  {team.athletes.map((athlete) => athlete.id === athleteId ? `${athlete.name} (você)` : athlete.name).join(', ')}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
