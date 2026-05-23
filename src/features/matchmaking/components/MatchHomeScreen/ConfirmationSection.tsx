import React, { memo } from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../../ui/tokens/theme';
import { CounterBadge } from '../CounterBadge';
import { s } from '../MatchHomeScreen.styles';
import { MatchHomeController } from './types';

type ConfirmationSectionProps = {
  controller: MatchHomeController;
};

function ConfirmationSectionComponent({ controller }: ConfirmationSectionProps) {
  const { data, presenceFilter, setPresenceFilter, summary } = controller;
  if (!data || !summary || data.status === 'FINISHED') return null;

  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>Confirmacoes</Text>
      <View style={s.counterCard}>
        <CounterBadge value={summary.confirmed} label="Confirmados" color={Colors.success} active={presenceFilter === 'CONFIRMED'} onPress={() => setPresenceFilter(presenceFilter === 'CONFIRMED' ? 'ALL' : 'CONFIRMED')} />
        <CounterBadge value={summary.pending} label="Pendentes" color={Colors.warning} active={presenceFilter === 'PENDING'} onPress={() => setPresenceFilter(presenceFilter === 'PENDING' ? 'ALL' : 'PENDING')} />
        <CounterBadge value={summary.waitlisted} label="Na fila" color={Colors.primary} active={presenceFilter === 'WAITLISTED'} onPress={() => setPresenceFilter(presenceFilter === 'WAITLISTED' ? 'ALL' : 'WAITLISTED')} />
        <CounterBadge value={summary.declined} label="Recusaram" color={Colors.error} active={presenceFilter === 'DECLINED'} onPress={() => setPresenceFilter(presenceFilter === 'DECLINED' ? 'ALL' : 'DECLINED')} />
        <CounterBadge value={summary.spotsLeft} label="Vagas livres" color={Colors.n500} active={false} />
      </View>

      <View style={s.progressBg}>
        <View style={[s.progressFill, { width: `${summary.pct}%` as any }]} />
      </View>
      <Text style={s.progressLabel}>
        {summary.confirmed} de {data.totalVacancies} vagas preenchidas - minimo {summary.minimumConfirmed}
      </Text>

      {summary.shouldSuggestSpot && (
        <View style={s.hintBox}>
          <Ionicons name="person-add-outline" size={16} color={Colors.warningDark} />
          <Text style={s.hintText}>
            Faltam {Math.max(summary.minimumConfirmed - summary.confirmed, 0)} atleta(s) para confirmar o jogo. Considere convidar avulsos.
          </Text>
        </View>
      )}
    </View>
  );
}

export const ConfirmationSection = memo(ConfirmationSectionComponent);
