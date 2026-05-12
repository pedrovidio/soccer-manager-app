import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ConfirmedMatch } from '../../../athletes/athleteTypes';
import { Colors } from '../../../common/theme';
import { styles } from './MatchCard.styles';

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
  confirmed?: boolean;
}

export function MatchCard({ match, athleteId, confirmed }: MatchCardProps) {
  const router = useRouter();
  const fillPct = match.totalSlots > 0 ? (match.confirmedSlots / match.totalSlots) * 100 : 0;
  const isFinished = match.status === 'FINISHED';
  const isAdmin = match.isGroupAdmin === true;
  const hasMatchmaking = match.hasMatchmaking === true && !!match.matchmakingResult;
  const myTeam = hasMatchmaking
    ? match.matchmakingResult!.teams.find((team) => team.athletes.some((athlete) => athlete.id === athleteId))
    : null;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => router.push({ pathname: '/match-home', params: { matchId: match.id, groupId: match.groupId, isAdmin: isAdmin ? '1' : '0' } } as any)}
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
        {confirmed && !isFinished && (
          <View style={styles.confPill}>
            <Ionicons name="checkmark" size={10} color={Colors.successDark} />
            <Text style={styles.confText}>Confirmado</Text>
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

        {!isFinished && !hasMatchmaking && (
          <View style={isAdmin ? styles.drawShortcut : styles.waitingBox}>
            <Ionicons name={isAdmin ? 'shuffle-outline' : 'hourglass-outline'} size={15} color={isAdmin ? Colors.primary : Colors.warningDark} />
            <Text style={isAdmin ? styles.drawShortcutText : styles.waitingText}>
              {isAdmin ? 'Ir para sorteio dos times' : 'Aguardando o sorteio'}
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
                  {team.athletes.map((athlete) => athlete.id === athleteId ? `${athlete.name} (voce)` : athlete.name).join(', ')}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
