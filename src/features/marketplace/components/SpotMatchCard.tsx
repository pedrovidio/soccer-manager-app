import React, { memo, useMemo } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Arena } from '@ui/tokens/theme';
import type { SpotMarketplaceMatch } from '@features/matchmaking/types';
import { InfoLine } from './InfoLine';
import { formatMarketplaceCurrency, formatMarketplaceDate } from './marketplaceFormatters';
import { styles } from './styles';

type SpotMatchCardProps = {
  match: SpotMarketplaceMatch;
  isPending: boolean;
  onApply: (matchId: string) => void;
};

function SpotMatchCardComponent({ match, isPending, onApply }: SpotMatchCardProps) {
  const waiting = match.applicationStatus === 'PENDING' || match.applicationStatus === 'WAITLISTED';
  const disabled = isPending || waiting;
  const criteria = useMemo(() => (
    `${match.type} · OVR mínimo ${match.minOverall} · ${match.minAge}-${match.maxAge} anos · ${formatMarketplaceCurrency(match.spotFee)}`
  ), [match.maxAge, match.minAge, match.minOverall, match.spotFee, match.type]);

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.iconBox}>
          <Ionicons name="football-outline" size={20} color={Arena.neon} />
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={1}>{match.groupName}</Text>
          <Text style={styles.cardSub} numberOfLines={1}>{match.location}</Text>
        </View>
      </View>

      <InfoLine icon="calendar-outline" text={formatMarketplaceDate(match.date)} />
      <InfoLine icon="navigate-outline" text={`${match.distanceKm} km de distância`} />
      <InfoLine icon="people-outline" text={`${match.vacanciesLeft} vaga(s) aberta(s) de ${match.totalVacancies}`} />
      <Text style={styles.criteria}>{criteria}</Text>

      <TouchableOpacity
        style={[styles.primaryBtn, disabled ? styles.disabledBtn : null]}
        onPress={() => onApply(match.id)}
        disabled={disabled}
      >
        {isPending ? (
          <ActivityIndicator color={Arena.bgDeep} size="small" />
        ) : (
          <Text style={styles.primaryBtnText}>{waiting ? 'Aguardando aprovação' : 'Candidatar-se'}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

export const SpotMatchCard = memo(SpotMatchCardComponent);
