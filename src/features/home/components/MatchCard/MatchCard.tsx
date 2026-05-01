import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Match } from '../../../matchmaking/types';
import { Badge } from '../../../common/components/Badge';
import { Colors } from '../../../common/theme';
import { styles } from './MatchCard.styles';

const STATUS_MAP: Record<string, { label: string; variant: 'inf' | 'ok' | 'neutral' | 'err' }> = {
  SCHEDULED:   { label: 'Agendada',      variant: 'inf' },
  IN_PROGRESS: { label: 'Em andamento',  variant: 'ok' },
  FINISHED:    { label: 'Finalizada',    variant: 'neutral' },
  CANCELLED:   { label: 'Cancelada',     variant: 'err' },
};

const TYPE_STYLE: Record<string, object> = {
  Campo:   styles.tagCampo,
  Society: styles.tagSociety,
  Futsal:  styles.tagFutsal,
};

interface MatchCardProps {
  match: Match;
  confirmed?: boolean;
}

export function MatchCard({ match, confirmed }: MatchCardProps) {
  const status = STATUS_MAP[match.status];
  const isFinished = match.status === 'FINISHED';
  const fillPct = (match.confirmedSlots / match.totalSlots) * 100;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.dateText}>{match.date} · {match.time}</Text>
          <Text style={styles.locText}>{match.location} · {match.city}</Text>
        </View>
        {confirmed && !isFinished ? (
          <View style={styles.confPill}>
            <Ionicons name="checkmark" size={10} color={Colors.successDark} />
            <Text style={styles.confText}>Confirmado</Text>
          </View>
        ) : (
          <Badge label={status.label} variant={status.variant} />
        )}
      </View>

      <View style={styles.body}>
        <View style={styles.vsRow}>
          <View style={styles.teamBlock}>
            <View style={styles.teamLogo}>
              <Ionicons name="football-outline" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.teamName}>{match.teamA ?? 'Time A'}</Text>
          </View>

          {isFinished ? (
            <Text style={styles.scoreBig}>{match.scoreA} × {match.scoreB}</Text>
          ) : (
            <Text style={styles.vsBadge}>VS</Text>
          )}

          <View style={styles.teamBlock}>
            <View style={styles.teamLogo}>
              <Ionicons name="football-outline" size={20} color={Colors.successDark} />
            </View>
            <Text style={styles.teamName}>{match.teamB ?? 'Time B'}</Text>
          </View>
        </View>

        <View style={styles.tagsRow}>
          <Text style={[styles.tag, TYPE_STYLE[match.type]]}>{match.type}</Text>
          {match.minOverall && <Badge label={`Overall ${match.minOverall}+`} variant="neutral" />}
          {match.distanceKm && <Badge label={`${match.distanceKm} km`} variant="neutral" />}
        </View>

        {!isFinished && (
          <>
            <View style={styles.progLabel}>
              <Text style={styles.progLabelText}>Vagas preenchidas</Text>
              <Text style={styles.progLabelVal}>{match.confirmedSlots}/{match.totalSlots}</Text>
            </View>
            <View style={styles.progBg}>
              <View style={[styles.progFill, { width: `${fillPct}%` as any }]} />
            </View>
          </>
        )}
      </View>
    </View>
  );
}
