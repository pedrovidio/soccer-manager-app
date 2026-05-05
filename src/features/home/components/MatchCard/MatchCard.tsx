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
  confirmed?: boolean;
}

export function MatchCard({ match, confirmed }: MatchCardProps) {
  const router = useRouter();
  const fillPct = match.totalSlots > 0 ? (match.confirmedSlots / match.totalSlots) * 100 : 0;
  const isFinished = match.status === 'FINISHED';

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => router.push({ pathname: '/match-home', params: { matchId: match.id, groupId: match.groupId, isAdmin: '0' } } as any)}
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
      </View>
    </TouchableOpacity>
  );
}
