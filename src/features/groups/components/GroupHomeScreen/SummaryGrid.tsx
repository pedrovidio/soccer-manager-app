import React, { memo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../../ui/tokens/theme';
import { GroupHomeData } from '../../groupTypes';
import { formatCurrency } from '../../utils/financeFormatters';
import { formatMatchDate } from '../../utils/matchFormatters';
import { styles } from './styles';

type Props = {
  data: GroupHomeData;
  blockedCount: number;
  favoriteSpotCount: number;
  onMembers: () => void;
  onSpot: () => void;
  onFinance: () => void;
  onMatches: () => void;
};

function SummaryGridComponent({ data, blockedCount, favoriteSpotCount, onMembers, onSpot, onFinance, onMatches }: Props) {
  const { isAdmin, members, upcomingMatches, balance } = data;
  const nextMatch = upcomingMatches[0];

  return (
    <View style={styles.grid}>
      <SummaryCard
        icon="people-outline"
        label="Membros"
        value={`${members.length}`}
        sub={blockedCount > 0 ? `${blockedCount} com alerta` : 'Grupo ativo'}
        onPress={onMembers}
      />
      {isAdmin && (
        <SummaryCard
          icon="star-outline"
          label="Avulsos"
          value={`${favoriteSpotCount}`}
          sub="Favoritos"
          onPress={onSpot}
        />
      )}
      {isAdmin && balance && (
        <SummaryCard
          icon="wallet-outline"
          label="Em caixa"
          value={formatCurrency(balance.cashInHand)}
          sub={`${formatCurrency(balance.totalPending)} pendente`}
          onPress={onFinance}
        />
      )}
      <SummaryCard
        icon="calendar-outline"
        label="Partidas"
        value={`${upcomingMatches.length}`}
        sub={nextMatch ? `Proxima: ${formatMatchDate(nextMatch.date)}` : 'Nenhuma agendada'}
        onPress={onMatches}
      />
    </View>
  );
}

function SummaryCard({ icon, label, value, sub, onPress }: { icon: any; label: string; value: string; sub: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.summaryCard} onPress={onPress} activeOpacity={0.75}>
      <Ionicons name={icon} size={20} color={Colors.primary} />
      <Text style={styles.summaryValue} numberOfLines={1}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summarySub} numberOfLines={1}>{sub}</Text>
    </TouchableOpacity>
  );
}

export const SummaryGrid = memo(SummaryGridComponent);
